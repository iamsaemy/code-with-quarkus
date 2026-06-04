// 문자열을 SHA-256 해시값으로 변환하는 함수
async function hashPassword(password) {
  // 입력 문자열을 바이트 배열로 변환
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // 브라우저 내장 Web Crypto API로 SHA-256 해시 생성
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // ArrayBuffer를 byte 배열로 변환
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // byte 값을 16진수 문자열로 변환
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}
