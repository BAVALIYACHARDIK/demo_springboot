package com.example.demo_springboot.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

import com.example.demo_springboot.model.Hashtag;
import com.example.demo_springboot.model.User;
import com.example.demo_springboot.model.Community;
import com.example.demo_springboot.model.Flag;

@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    private Instant createdAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToMany
    @JoinTable(name = "posts_hashtags", joinColumns = @JoinColumn(name = "post_id"), inverseJoinColumns = @JoinColumn(name = "hashtag_id"))
    private Set<Hashtag> hashtags = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id")
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flag_id")
    private Flag flag;

    @PrePersist
    void prePersist() {
        if (createdAt == null)
            createdAt = Instant.now();
    }
}
