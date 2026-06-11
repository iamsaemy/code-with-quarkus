package org.acme.stats;

import java.util.HashMap;
import java.util.Map;

import org.acme.favorite.FavoriteChampion;
import org.acme.memo.ChampionMemo;
import org.acme.recent.RecentChampion;

import io.vertx.ext.web.RoutingContext;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * 추가 구현 기능 4: 나의 활동 통계 대시보드 API
 *
 * 현재 로그인한 사용자의 활동 정보를 통계 형태로 제공한다.
 *
 * 통계 항목
 * 1. 즐겨찾기한 챔피언 수
 * 2. 최근 본 챔피언 수
 * 3. 작성한 챔피언 메모 수
 */
@Path("/stats")
@Produces(MediaType.APPLICATION_JSON)
public class UserStatsResource {

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
     * GET /stats/my
     *
     * 로그인 사용자의 활동 통계 조회
     */
    @GET
    @Path("/my")
    public Response myStats() {
        String loginUser = getLoginUser();

        if (loginUser == null) {
            return Response
                    .status(Response.Status.UNAUTHORIZED)
                    .entity(Map.of("error", "login_required"))
                    .build();
        }

        long favoriteCount = FavoriteChampion.count("username", loginUser);
        long recentCount = RecentChampion.count("username", loginUser);
        long memoCount = ChampionMemo.count("username", loginUser);

        Map<String, Object> result = new HashMap<>();
        result.put("username", loginUser);
        result.put("favoriteCount", favoriteCount);
        result.put("recentCount", recentCount);
        result.put("memoCount", memoCount);
        result.put("totalActivityCount", favoriteCount + recentCount + memoCount);

        return Response.ok(result).build();
    }
}