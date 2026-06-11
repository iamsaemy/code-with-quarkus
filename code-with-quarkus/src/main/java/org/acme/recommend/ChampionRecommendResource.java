package org.acme.recommend;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.acme.champion.Champion;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * 추가 구현 기능 5: 조건 기반 챔피언 추천 API
 *
 * 사용자가 선택한 라인과 난이도를 기준으로
 * DB에 저장된 챔피언 데이터를 추천한다.
 */
@Path("/recommend")
@Produces(MediaType.APPLICATION_JSON)
public class ChampionRecommendResource {

    /**
     * GET /recommend/champions?line=탑&difficulty=상
     *
     * line, difficulty 조건에 맞는 챔피언 추천
     */
    @GET
    @Path("/champions")
    public Response recommendChampions(
            @QueryParam("line") String line,
            @QueryParam("difficulty") String difficulty) {

        String searchLine = line == null ? "" : line.trim();
        String searchDifficulty = difficulty == null ? "" : difficulty.trim();

        List<Champion> champions;

        if (!searchLine.isBlank() && !searchDifficulty.isBlank()) {
            champions = Champion.list(
                    "line like ?1 and difficulty = ?2",
                    "%" + searchLine + "%",
                    searchDifficulty);
        } else if (!searchLine.isBlank()) {
            champions = Champion.list(
                    "line like ?1",
                    "%" + searchLine + "%");
        } else if (!searchDifficulty.isBlank()) {
            champions = Champion.list(
                    "difficulty = ?1",
                    searchDifficulty);
        } else {
            champions = Champion.listAll();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("line", searchLine);
        result.put("difficulty", searchDifficulty);
        result.put("count", champions.size());
        result.put("champions", champions);

        return Response.ok(result).build();
    }
}