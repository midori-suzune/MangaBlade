package com.mangablade.backend.dtos.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

import lombok.*;

@NoArgsConstructor
@Getter
@Setter
@Builder
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T>{
    private boolean success;
    private String message;
    private T payload;
    private String error ;
    private Map<String,String> fieldsErrors;

}
