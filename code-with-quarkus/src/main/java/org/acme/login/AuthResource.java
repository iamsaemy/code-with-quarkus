package org.acme.login;

import java.io.InputStream;
import java.net.URI;

import io.vertx.ext.web.RoutingContext;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/")
public class AuthResource {

    @Inject
    RoutingContext context;

    @GET
    @Path("/login")
    @Produces(MediaType.TEXT_HTML)
    public Response loginPage() {
        InputStream html = getClass()
                .getClassLoader()
                .getResourceAsStream("META-INF/resources/login/login.html");

        return Response.ok(html).build();
    }

    @POST
    @Path("/login_check")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Transactional
    public Response loginCheck(
            @FormParam("username") String username,
            @FormParam("password") String password) {

        User user = User.findByUsername(username);

        if (user == null || !user.password.equals(password)) {
            return Response
                    .seeOther(URI.create("/login/login_failed.html"))
                    .build();
        }

        // 로그인 성공 시 세션에 사용자 아이디 저장
        context.session().put("loginUser", username);

        return Response
                .seeOther(URI.create("/after_login"))
                .build();
    }

    @GET
    @Path("/after_login")
    @Produces(MediaType.TEXT_HTML)
    public Response afterLogin() {
        // 세션 기능이 없거나 로그인 정보가 없으면 로그인 페이지로 이동
        if (context.session() == null || context.session().get("loginUser") == null) {
            return Response
                    .seeOther(URI.create("/login"))
                    .build();
        }

        String loginUser = context.session().get("loginUser");

        System.out.println("=== 세션 ID : " + context.session().id());
        System.out.println("=== loginUser : " + loginUser);

        InputStream html = getClass()
                .getClassLoader()
                .getResourceAsStream("META-INF/resources/login/main_after_login.html");

        return Response.ok(html).build();
    }

    @GET
    @Path("/logout")
    public Response logout() {
        if (context.session() != null) {
            System.out.println("=== 로그아웃 전 세션 ID : " + context.session().id());
            System.out.println("=== 로그아웃 전 loginUser : " + context.session().get("loginUser"));

            context.session().destroy();
        }

        return Response
                .seeOther(URI.create("/"))
                .build();
    }
}