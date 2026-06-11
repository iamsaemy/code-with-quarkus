package org.acme.favorite;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * 로그인 사용자별 챔피언 즐겨찾기 정보를 저장하는 Entity
 *
 * 예)
 * guest 사용자가 아트록스를 즐겨찾기하면
 * username = "guest"
 * championId = 1
 * 형태로 DB에 저장된다.
 */
@Entity
@Table(
    name = "favorite_champions",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"username", "championId"})
    }
)
public class FavoriteChampion extends PanacheEntity {

    // 즐겨찾기를 등록한 사용자 아이디
    public String username;

    // 즐겨찾기한 챔피언 ID
    public Long championId;

    /**
     * 특정 사용자가 특정 챔피언을 이미 즐겨찾기했는지 조회
     */
    public static FavoriteChampion findByUsernameAndChampionId(String username, Long championId) {
        return find("username = ?1 and championId = ?2", username, championId).firstResult();
    }
}