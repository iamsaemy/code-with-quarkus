package org.acme.recent;

import java.time.LocalDateTime;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * 로그인 사용자별 최근 본 챔피언 정보를 저장하는 Entity
 *
 * 예)
 * guest 사용자가 아트록스 카드를 클릭하면
 * username = "guest"
 * championId = 1751
 * viewedAt = 현재 시간
 * 형태로 DB에 저장된다.
 */
@Entity
@Table(
    name = "recent_champions",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"username", "championId"})
    }
)
public class RecentChampion extends PanacheEntity {

    // 최근 본 사용자 아이디
    public String username;

    // 최근 본 챔피언 ID
    public Long championId;

    // 최근 본 시간
    public LocalDateTime viewedAt;

    /**
     * 특정 사용자가 특정 챔피언을 이미 최근 본 목록에 가지고 있는지 조회
     */
    public static RecentChampion findByUsernameAndChampionId(String username, Long championId) {
        return find("username = ?1 and championId = ?2", username, championId).firstResult();
    }
}