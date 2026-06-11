package org.acme.memo;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.acme.champion.Champion;

import io.vertx.ext.web.RoutingContext;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * 챔피언 개인 메모 REST API
 *
 * 기능
 * 1. 로그인 사용자별 챔피언 메모 저장/수정
 * 2. 로그인 사용자의 전체 메모 목록 조회
 * 3. 특정 챔피언 메모 삭제
 */
@Path("/memos")
@Produces(MediaType.APPLICATION_JSON)
public class ChampionMemoResource {

    @Inject
    RoutingContext context;

    /**
     * 현재 로그인한 사용자 아이디 가져오기
     */
    private String getLoginUser() {
        if (context.session() == null) {
            return null;
        }

        return context.session().get("loginUser");
    }

    /**
     * 로그인하지 않은 사용자가 접근했을 때 공통 응답
     */
    private Response loginRequiredResponse() {
        return Response
                .status(Response.Status.UNAUTHORIZED)
                .entity(Map.of("error", "login_required"))
                .build();
    }

    /**
     * GET /memos/my
     *
     * 현재 로그인 사용자가 작성한 챔피언 메모 목록 조회
     */
    @GET
    @Path("/my")
    public Response myMemos() {
        String loginUser = getLoginUser();

        if (loginUser == null) {
            return loginRequiredResponse();
        }

        List<ChampionMemo> memoList = ChampionMemo.list("username", loginUser);
        List<Map<String, Object>> result = new ArrayList<>();

        for (ChampionMemo championMemo : memoList) {
            Champion champion = Champion.findById(championMemo.championId);

            if (champion == null) {
                continue;
            }

            Map<String, Object> item = new HashMap<>();
            item.put("championId", champion.id);
            item.put("name", champion.name);
            item.put("engName", champion.engName);
            item.put("role", champion.role);
            item.put("line", champion.line);
            item.put("img", champion.img);
            item.put("difficulty", champion.difficulty);
            item.put("memo", championMemo.memo == null ? "" : championMemo.memo);
            item.put("updatedAt", championMemo.updatedAt == null ? "" : championMemo.updatedAt.toString());

            result.add(item);
        }

        return Response.ok(result).build();
    }

    /**
     * POST /memos/save
     *
     * 챔피언 개인 메모 저장 또는 수정
     *
     * 이미 메모가 있으면 수정
     * 없으면 새로 저장
     */
    @POST
    @Path("/save")
    @Transactional
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response saveMemo(
            @FormParam("championId") Long championId,
            @FormParam("memo") String memo) {

        String loginUser = getLoginUser();

        if (loginUser == null) {
            return loginRequiredResponse();
        }

        Champion champion = Champion.findById(championId);

        if (champion == null) {
            return Response
                    .status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "champion_not_found"))
                    .build();
        }

        String safeMemo = memo == null ? "" : memo.trim();

        if (safeMemo.isBlank()) {
            return Response
                    .status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "memo_empty"))
                    .build();
        }

        if (safeMemo.length() > 1000) {
            return Response
                    .status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "memo_too_long"))
                    .build();
        }

        ChampionMemo championMemo = ChampionMemo.findByUsernameAndChampionId(loginUser, championId);

        if (championMemo == null) {
            championMemo = new ChampionMemo();
            championMemo.username = loginUser;
            championMemo.championId = championId;
            championMemo.memo = safeMemo;
            championMemo.updatedAt = LocalDateTime.now();
            championMemo.persist();
        } else {
            championMemo.memo = safeMemo;
            championMemo.updatedAt = LocalDateTime.now();
        }

        return Response.ok(
                Map.of(
                        "saved", true,
                        "message", "챔피언 메모가 저장되었습니다.",
                        "championId", championId))
                .build();
    }

    /**
     * DELETE /memos/{championId}
     *
     * 특정 챔피언 메모 삭제
     */
    @DELETE
    @Path("/{championId}")
    @Transactional
    public Response deleteMemo(@PathParam("championId") Long championId) {
        String loginUser = getLoginUser();

        if (loginUser == null) {
            return loginRequiredResponse();
        }

        ChampionMemo championMemo = ChampionMemo.findByUsernameAndChampionId(loginUser, championId);

        if (championMemo == null) {
            return Response.ok(
                    Map.of(
                            "deleted", false,
                            "message", "삭제할 메모가 없습니다."))
                    .build();
        }

        championMemo.delete();

        return Response.ok(
                Map.of(
                        "deleted", true,
                        "message", "챔피언 메모가 삭제되었습니다.",
                        "championId", championId))
                .build();
    }
}