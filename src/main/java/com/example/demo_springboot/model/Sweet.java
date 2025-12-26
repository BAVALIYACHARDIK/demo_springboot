package com.example.demo_springboot.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "sweets")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Sweet {
    @Id
    private String id;
    private String name;
    private String category;
    private Double price;
    private String image;
}
