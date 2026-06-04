package org.acme.login;

import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

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

        // 12주차 마무리 과제: 로그인 실패 시 login 페이지에 error 파라미터 전달
        if (user == null || !user.password.equals(password)) {
            return Response
                    .seeOther(URI.create("/login/?error=1"))
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
    @Path("/profile")
    @Produces(MediaType.TEXT_HTML)
    public Response profilePage() {
        if (context.session() == null || context.session().get("loginUser") == null) {
            return Response
                    .seeOther(URI.create("/login"))
                    .build();
        }

        String loginUser = context.session().get("loginUser");
        User user = User.findByUsername(loginUser);

        if (user == null) {
            return Response
                    .seeOther(URI.create("/login"))
                    .build();
        }

        context.session().put("username", user.username);
        context.session().put("email", user.email);
        context.session().put("phone", user.phone);
        context.session().put("profileImage", user.profileImage);

        InputStream html = getClass()
                .getClassLoader()
                .getResourceAsStream("META-INF/resources/login/profile.html");

        return Response.ok(html).build();
    }

    @GET
    @Path("/profile/info")
    @Produces(MediaType.APPLICATION_JSON)
    public Response profileInfo() {
        if (context.session() == null || context.session().get("loginUser") == null) {
            return Response
                    .status(Response.Status.UNAUTHORIZED)
                    .entity(Map.of("error", "login_required"))
                    .build();
        }

        String loginUser = context.session().get("loginUser");
        User user = User.findByUsername(loginUser);

        if (user == null) {
            return Response
                    .status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "user_not_found"))
                    .build();
        }

        String email = user.email == null ? "" : user.email;
        String phone = user.phone == null ? "" : user.phone;
        String profileImage = user.profileImage == null ? "" : user.profileImage;

        return Response.ok(
                Map.of(
                        "username", user.username,
                        "email", email,
                        "phone", phone,
                        "profileImage", profileImage))
                .build();
    }

    // 12주차 마무리 과제: 프로필 이미지 업로드 성공/실패 처리
    @POST
    @Path("/profile/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Transactional
    public Response uploadProfileImage(@RestForm("profileImage") FileUpload profileImage) {
        if (context.session() == null || context.session().get("loginUser") == null) {
            return Response
                    .seeOther(URI.create("/login"))
                    .build();
        }

        if (profileImage == null || profileImage.fileName() == null || profileImage.fileName().isBlank()) {
            return Response
                    .seeOther(URI.create("/profile?error=upload_fail"))
                    .build();
        }

        String loginUser = context.session().get("loginUser");
        User user = User.findByUsername(loginUser);

        if (user == null) {
            return Response
                    .seeOther(URI.create("/login"))
                    .build();
        }

        try {
            String originalFileName = profileImage.fileName();
            String lowerFileName = originalFileName.toLowerCase();

            // 이미지 확장자만 허용
            boolean validImageType = lowerFileName.endsWith(".jpg")
                    || lowerFileName.endsWith(".jpeg")
                    || lowerFileName.endsWith(".png")
                    || lowerFileName.endsWith(".gif")
                    || lowerFileName.endsWith(".webp");

            if (!validImageType) {
                return Response
                        .seeOther(URI.create("/profile?error=invalid_type"))
                        .build();
            }

            // 5MB 초과 업로드 차단
            long fileSize = Files.size(profileImage.uploadedFile());
            long maxSize = 5 * 1024 * 1024;

            if (fileSize > maxSize) {
                return Response
                        .seeOther(URI.create("/profile?error=too_large"))
                        .build();
            }

            String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String savedFileName = loginUser + "_" + UUID.randomUUID() + extension;

            java.nio.file.Path uploadDir = java.nio.file.Path.of(
                    "src/main/resources/META-INF/resources/uploads/profile");

            Files.createDirectories(uploadDir);

            java.nio.file.Path savePath = uploadDir.resolve(savedFileName);

            Files.copy(
                    profileImage.uploadedFile(),
                    savePath,
                    StandardCopyOption.REPLACE_EXISTING);

            // DB 업데이트
            user.profileImage = savedFileName;
            user.persist();

            context.session().put("profileImage", savedFileName);

            System.out.println("=== 프로필 이미지 업로드 완료 : " + savedFileName);

            return Response
                    .seeOther(URI.create("/profile"))
                    .build();

        } catch (Exception e) {
            e.printStackTrace();

            return Response
                    .seeOther(URI.create("/profile?error=upload_fail"))
                    .build();
        }
    }

    @GET
    @Path("/register")
    @Produces(MediaType.TEXT_HTML)
    public Response registerPage() {
        InputStream html = getClass()
                .getClassLoader()
                .getResourceAsStream("META-INF/resources/login/register.html");

        return Response.ok(html).build();
    }

    @GET
    @Path("/register_success")
    @Produces(MediaType.TEXT_HTML)
    public Response registerSuccessPage() {
        InputStream html = getClass()
                .getClassLoader()
                .getResourceAsStream("META-INF/resources/login/register_success.html");

        return Response.ok(html).build();
    }

    @POST
    @Path("/register_check")
    @Transactional
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_HTML)
    public Response registerCheck(
            @FormParam("username") String username,
            @FormParam("password") String password,
            @FormParam("email") String email,
            @FormParam("phone") String phone) {

        if (User.findByUsername(username) != null) {
            return Response
                    .seeOther(URI.create("/register?error=duplicate_username"))
                    .build();
        }

        if (User.findByEmail(email) != null) {
            return Response
                    .seeOther(URI.create("/register?error=duplicate_email"))
                    .build();
        }

        User newUser = new User();
        newUser.username = username;
        newUser.password = password;
        newUser.email = email;
        newUser.phone = phone;
        newUser.profileImage = null;
        newUser.persist();

        return Response
                .seeOther(URI.create("/register_success"))
                .build();
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