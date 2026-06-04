package org.acme.login;

import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.SessionHandler;
import io.vertx.ext.web.sstore.LocalSessionStore;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

@ApplicationScoped
public class SessionConfig {

    @Inject
    Vertx vertx;

    public void init(@Observes Router router) {
        // Quarkus 라우터에 세션 기능을 등록한다.
        router.route().handler(
                SessionHandler
                        .create(LocalSessionStore.create(vertx))
                        .setSessionTimeout(60 * 60 * 1000L)
                        .setCookieHttpOnlyFlag(true)
        );
    }
}