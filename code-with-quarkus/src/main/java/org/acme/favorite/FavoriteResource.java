package org.acme.favorite;

import java.net.URI;
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
 * 챔피언 즐겨찾기 REST API
 *
 * 기능
 * 1. 로그인 사용자 즐겨찾기 ID 목록 조회
 * 2. 로그인 사용자 즐겨찾기 챔피언 목록 조회
 * 3. 챔피언 즐겨찾기 추가/삭제 토글
 * 4. 즐겨찾기 전체 삭제
 */
@Path("/favorites")
@Produces(MediaType.APPLICATION_JSON)
public class FavoriteResource {

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
     * GET /favorites/ids
     *
     * 현재 로그인 사용자가 즐겨찾기한 챔피언 ID 목록 반환
     *
     * 예)
     * [1, 3, 5]
     */
    @GET
    @Path("/ids")
    public Response favoriteIds() {
        String loginUser = getLoginUser();

        if (loginUser == null) {
            return loginRequiredResponse();
        }

        List<FavoriteChampion> favorites = FavoriteChampion.list("username", loginUser);

        List<Long> championIds = favorites
                .stream()
                .map(favorite -> favorite.championId)
                .toList();

        return Response.ok(championIds).build();
    }

    /**
     * GET /favorites/my
     *
     * 현재 로그인 사용자가 즐겨찾기한 챔피언 전체 정보 반환
     *
     * 예)
     * [
     *   { id: 1, name: "아트록스", ... },
     *   { id: 2, name: "사일러스", ... }
     * ]
     */
    @GET
    @Path("/my")
    public Response myFavoriteChampions() {
        String loginUser = getLoginUser();

        if (loginUser == null) {
            return loginRequiredResponse();
        }

        List<FavoriteChampion> favorites = FavoriteChampion.list("username", loginUser);

        List<Champion> champions = favorites
                .stream()
                .map(favorite -> Champion.<Champion>findById(favorite.championId))
                .filter(champion -> champion != null)
                .toList();

        return Response.ok(champions).build();
    }

    /**
     * POST /favorites/toggle/{championId}
     *
     * 즐겨찾기 토글
     *
     * 이미 즐겨찾기 상태이면 삭제
     * 즐겨찾기 상태가 아니면 추가
     */
    @POST
    @Path("/toggle/{championId}")
    @Transactional
    public Response toggleFavorite(@PathParam("championId") Long championId) {
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

        FavoriteChampion favorite = FavoriteChampion.findByUsernameAndChampionId(loginUser, championId);

        if (favorite != null) {
            favorite.delete();

            return Response.ok(
                    Map.of(
                            "favorited", false,
                            "message", "즐겨찾기가 해제되었습니다.",
                            "championId", championId))
                    .build();
        }

        FavoriteChampion newFavorite = new FavoriteChampion();
        newFavorite.username = loginUser;
        newFavorite.championId = championId;
        newFavorite.persist();

        return Response.ok(
                Map.of(
                        "favorited", true,
                        "message", "즐겨찾기에 추가되었습니다.",
                        "championId", championId))
                .build();
    }

    /**
     * DELETE /favorites/{championId}
     *
     * 특정 챔피언 즐겨찾기 삭제
     * 나중에 프로필 페이지에서 삭제 버튼 만들 때 사용 가능
     */
    @DELETE
    @Path("/{championId}")
    @Transactional
    public Response deleteFavorite(@PathParam("championId") Long championId) {
        String loginUser = getLoginUser();

        if (loginUser == null) {
            return loginRequiredResponse();
        }

        FavoriteChampion favorite = FavoriteChampion.findByUsernameAndChampionId(loginUser, championId);

        if (favorite == null) {
            return Response.ok(
                    Map.of(
                            "deleted", false,
                            "message", "삭제할 즐겨찾기가 없습니다."))
                    .build();
        }

        favorite.delete();

        return Response.ok(
                Map.of(
                        "deleted", true,
                        "message", "즐겨찾기가 삭제되었습니다.",
                        "championId", championId))
                .build();
    }

    /**
     * GET /favorites/page
     *
     * 나중에 즐겨찾기 전용 페이지를 만들 경우를 대비한 이동 경로
     * 지금 당장은 필수 사용 아님
     */
    @GET
    @Path("/page")
    public Response favoritePage() {
        String loginUser = getLoginUser();

        if (loginUser == null) {
            return Response
                    .seeOther(URI.create("/login"))
                    .build();
        }

        return Response
                .seeOther(URI.create("/profile"))
                .build();
    }
}