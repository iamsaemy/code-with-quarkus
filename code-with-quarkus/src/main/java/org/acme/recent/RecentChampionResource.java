package org.acme.recent;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.acme.champion.Champion;

import io.vertx.ext.web.RoutingContext;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * 최근 본 챔피언 REST API
 *
 * 기능
 * 1. 챔피언 카드 클릭 시 최근 본 챔피언 저장
 * 2. 현재 로그인 사용자의 최근 본 챔피언 목록 조회
 * 3. 최근 본 챔피언 목록 전체 삭제
 */
@Path("/recent")
@Produces(MediaType.APPLICATION_JSON)
public class RecentChampionResource {

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
     * POST /recent/view/{championId}
     *
     * 사용자가 챔피언 카드를 클릭했을 때 최근 본 챔피언으로 저장한다.
     * 이미 본 챔피언이면 viewedAt 시간만 최신으로 갱신한다.
     */
    @POST
    @Path("/view/{championId}")
    @Transactional
    public Response saveRecentChampion(@PathParam("championId") Long championId) {
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

        RecentChampion recent = RecentChampion.findByUsernameAndChampionId(loginUser, championId);

        if (recent == null) {
            recent = new RecentChampion();
            recent.username = loginUser;
            recent.championId = championId;
            recent.viewedAt = LocalDateTime.now();
            recent.persist();
        } else {
            recent.viewedAt = LocalDateTime.now();
        }

        return Response.ok(
                Map.of(
                        "saved", true,
                        "message", "최근 본 챔피언에 저장되었습니다.",
                        "championId", championId))
                .build();
    }

    /**
     * GET /recent/my
     *
     * 현재 로그인 사용자가 최근 본 챔피언 목록 조회
     * 최근 본 시간이 최신인 순서대로 최대 5개만 반환한다.
     */
    @GET
    @Path("/my")
    public Response myRecentChampions() {
        String loginUser = getLoginUser();

        if (loginUser == null) {
            return loginRequiredResponse();
        }

        List<RecentChampion> recentList = RecentChampion.list("username", loginUser);

        List<Champion> champions = recentList
                .stream()
                .sorted(Comparator.comparing((RecentChampion recent) -> recent.viewedAt).reversed())
                .limit(5)
                .map(recent -> Champion.<Champion>findById(recent.championId))
                .filter(champion -> champion != null)
                .toList();

        return Response.ok(champions).build();
    }

    /**
     * DELETE /recent/clear
     *
     * 현재 로그인 사용자의 최근 본 챔피언 목록 전체 삭제
     */
    @DELETE
    @Path("/clear")
    @Transactional
    public Response clearRecentChampions() {
        String loginUser = getLoginUser();

        if (loginUser == null) {
            return loginRequiredResponse();
        }

        List<RecentChampion> recentList = RecentChampion.list("username", loginUser);

        for (RecentChampion recent : recentList) {
            recent.delete();
        }

        return Response.ok(
                Map.of(
                        "cleared", true,
                        "message", "최근 본 챔피언 목록이 삭제되었습니다."))
                .build();
    }
}