package org.acme.memo;

import java.time.LocalDateTime;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * 로그인 사용자별 챔피언 개인 메모를 저장하는 Entity
 *
 * 예)
 * username = "guest"
 * championId = 1801
 * memo = "탑 라인에서 사용하기 좋음"
 */
@Entity
@Table(
    name = "champion_memos",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"username", "championId"})
    }
)
public class ChampionMemo extends PanacheEntity {

    // 메모를 작성한 사용자 아이디
    public String username;

    // 메모를 작성한 챔피언 ID
    public Long championId;

    // 메모 내용
    @Column(length = 1000)
    public String memo;

    // 마지막 수정 시간
    public LocalDateTime updatedAt;

    /**
     * 특정 사용자가 특정 챔피언에 작성한 메모 조회
     */
    public static ChampionMemo findByUsernameAndChampionId(String username, Long championId) {
        return find("username = ?1 and championId = ?2", username, championId).firstResult();
    }
}