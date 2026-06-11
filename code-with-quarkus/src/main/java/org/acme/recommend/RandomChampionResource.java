package org.acme.recommend;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.acme.champion.Champion;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * 추가 구현 기능 6: 랜덤 챔피언 추천 API
 *
 * DB에 저장된 챔피언 중 하나를 무작위로 선택하여 추천한다.
 */
@Path("/random")
@Produces(MediaType.APPLICATION_JSON)
public class RandomChampionResource {

    /**
     * GET /random/champion
     *
     * DB에 저장된 챔피언 중 랜덤으로 한 명 추천
     */
    @GET
    @Path("/champion")
    public Response randomChampion() {
        List<Champion> champions = Champion.listAll();

        if (champions == null || champions.isEmpty()) {
            return Response
                    .status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "champion_not_found"))
                    .build();
        }

        Random random = new Random();
        Champion selectedChampion = champions.get(random.nextInt(champions.size()));

        Map<String, Object> result = new HashMap<>();
        result.put("message", "랜덤 챔피언이 추천되었습니다.");
        result.put("champion", selectedChampion);

        return Response.ok(result).build();
    }
}