package org.acme.recommend;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.acme.champion.Champion;
import org.acme.favorite.FavoriteChampion;

import io.vertx.ext.web.RoutingContext;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * 추가 구현 기능 7: 내가 찜한 챔피언 중 랜덤 추천 API
 *
 * 현재 로그인한 사용자가 즐겨찾기한 챔피언 중
 * 실제 champions 테이블에 존재하는 챔피언만 골라 랜덤 추천한다.
 */
@Path("/favorite-random")
@Produces(MediaType.APPLICATION_JSON)
public class FavoriteRandomChampionResource {

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
     * GET /favorite-random/champion
     *
     * 로그인 사용자가 즐겨찾기한 챔피언 중 랜덤으로 한 명 추천
     */
    @GET
    @Path("/champion")
    @Transactional
    public Response randomFavoriteChampion() {
        String loginUser = getLoginUser();

        if (loginUser == null) {
            return Response
                    .status(Response.Status.UNAUTHORIZED)
                    .entity(Map.of("error", "login_required"))
                    .build();
        }

        List<FavoriteChampion> favoriteList = FavoriteChampion.list("username", loginUser);

        if (favoriteList == null || favoriteList.isEmpty()) {
            return Response
                    .status(Response.Status.NOT_FOUND)
                    .entity(Map.of(
                            "error", "favorite_not_found",
                            "message", "즐겨찾기한 챔피언이 없습니다."))
                    .build();
        }

        /*
         * 예전에 서버 재시작 또는 초기 데이터 재등록 과정에서
         * favorite_champions 테이블의 championId가
         * 현재 champions 테이블의 id와 맞지 않는 데이터가 남아 있을 수 있다.
         *
         * 따라서 실제 Champion.findById()로 조회되는 챔피언만 추천 후보에 넣는다.
         */
        List<Champion> validFavoriteChampions = new ArrayList<>();

        for (FavoriteChampion favorite : favoriteList) {
            Champion champion = Champion.findById(favorite.championId);

            if (champion != null) {
                validFavoriteChampions.add(champion);
            }
        }

        if (validFavoriteChampions.isEmpty()) {
            return Response
                    .status(Response.Status.NOT_FOUND)
                    .entity(Map.of(
                            "error", "valid_favorite_not_found",
                            "message", "현재 DB에 존재하는 즐겨찾기 챔피언이 없습니다. 다시 즐겨찾기를 추가해주세요."))
                    .build();
        }

        Random random = new Random();
        Champion selectedChampion = validFavoriteChampions.get(
                random.nextInt(validFavoriteChampions.size()));

        Map<String, Object> result = new HashMap<>();
        result.put("message", "내가 찜한 챔피언 중 랜덤으로 추천되었습니다.");
        result.put("username", loginUser);
        result.put("favoriteCount", validFavoriteChampions.size());
        result.put("champion", selectedChampion);

        return Response.ok(result).build();
    }
}