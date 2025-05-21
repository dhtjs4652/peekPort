package com.peekport.dto;

import com.peekport.model.Asset;
import lombok.Getter;

@Getter
public class AssetResponse {
    private Long id;
    private String ticker;
    private String name;
    private String category;

    public AssetResponse(Asset asset) {
        this.id = asset.getId();
        this.ticker = asset.getTicker();
        this.name = asset.getName();
        this.category = asset.getCategory();
    }
}
