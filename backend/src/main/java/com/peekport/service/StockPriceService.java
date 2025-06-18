package com.peekport.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class StockPriceService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${stock.api.kis.app-key}")
    private String appKey;

    @Value("${stock.api.kis.app-secret}")
    private String appSecret;

    @Value("${stock.api.kis.base-url}")
    private String baseUrl;

    private String accessToken;

    // 실시간 주가 조회 (한국투자증권 API)
    public BigDecimal getCurrentPrice(String stockCode) {
        try {
            if (accessToken == null) {
                accessToken = getAccessToken();
            }

            String url = baseUrl + "/uapi/domestic-stock/v1/quotations/inquire-price";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authorization", "Bearer " + accessToken);
            headers.set("appkey", appKey);
            headers.set("appsecret", appSecret);
            headers.set("tr_id", "FHKST01010100");

            // 요청 파라미터
            String requestUrl = url + "?fid_cond_mrkt_div_code=J&fid_input_iscd=" + stockCode;

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    requestUrl, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode output = root.path("output");
                String price = output.path("stck_prpr").asText(); // 현재가

                return new BigDecimal(price);
            }

        } catch (Exception e) {
            log.error("주가 조회 실패: {}", e.getMessage());
        }

        return null;
    }

    // 종목명으로 종목코드 검색
    public String searchStockCode(String stockName) {
        try {
            if (accessToken == null) {
                accessToken = getAccessToken();
            }

            String url = baseUrl + "/uapi/domestic-stock/v1/quotations/search-stock-info";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authorization", "Bearer " + accessToken);
            headers.set("appkey", appKey);
            headers.set("appsecret", appSecret);
            headers.set("tr_id", "CTPF1002R");

            String requestUrl = url + "?pdno=" + stockName + "&prdt_type_cd=300";

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    requestUrl, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode output = root.path("output");
                if (output.isArray() && output.size() > 0) {
                    return output.get(0).path("pdno").asText();
                }
            }

        } catch (Exception e) {
            log.error("종목코드 검색 실패: {}", e.getMessage());
        }

        return null;
    }

    private String getAccessToken() {
        try {
            String url = baseUrl + "/oauth2/tokenP";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = new HashMap<>();
            body.put("grant_type", "client_credentials");
            body.put("appkey", appKey);
            body.put("appsecret", appSecret);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("access_token").asText();
            }

        } catch (Exception e) {
            log.error("토큰 발급 실패: {}", e.getMessage());
        }

        return null;
    }
}