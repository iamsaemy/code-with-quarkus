package org.acme;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DataSeeder {

    @Transactional
    void onStart(@Observes StartupEvent ev) {
        // 실습용 초기 데이터 재등록
        Champion.deleteAll();

        persist("아트록스", "Aatrox", "전사", "탑", "images/Aatrox.png", "상");
        persist("사일러스", "Sylas", "마법사", "정글/미드", "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Sylas.png", "중");
        persist("애니비아", "Anivia", "마법사", "미드", "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Anivia.png", "상");
        persist("브라이어", "Briar", "전사", "정글", "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Briar.png", "중");
        persist("잭스", "Jax", "전사", "탑", "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Jax.png", "하");
        persist("징크스", "Jinx", "원거리딜러", "원딜", "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Jinx.png", "중");
        persist("야스오", "Yasuo", "전사", "미드/탑", "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Yasuo.png", "상");
        persist("리신", "LeeSin", "전사", "정글", "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/LeeSin.png", "상");
        persist("티모", "Teemo", "마법사", "탑", "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Teemo.png", "하");
        persist("케인", "Kayn", "암살자", "정글", "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Kayn.png", "중");
        persist("루시안", "Lucian", "원거리딜러", "원딜/미드", "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/Lucian.png", "중");
    }

    private void persist(String name, String engName, String role, String line, String img, String difficulty) {
        Champion c = new Champion();
        c.name = name;
        c.engName = engName;
        c.role = role;
        c.line = line;
        c.img = img;
        c.difficulty = difficulty;
        c.persist();
    }
}