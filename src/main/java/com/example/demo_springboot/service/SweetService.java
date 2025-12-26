package com.example.demo_springboot.service;

import com.example.demo_springboot.model.Sweet;
import com.example.demo_springboot.repository.SweetRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SweetService {

    private final SweetRepository sweetRepository;

    public SweetService(SweetRepository sweetRepository) {
        this.sweetRepository = sweetRepository;
    }

    @Cacheable(value = "sweets", key = "#root.methodName + ':' + #page + ':' + #limit + ':' + (#search?:'') + ':' + (#category?:'') + ':' + (#minPrice?:'') + ':' + (#maxPrice?:'')")
    public Map<String, Object> listSweets(int page, int limit, String search, String category, Double minPrice,
            Double maxPrice) {
        // normalize category: empty -> "all*" meaning match every category
        String normalizedCategory = category == null ? "all*" : category.trim();
        if (normalizedCategory.isEmpty())
            normalizedCategory = "all*";
        final String catFilter = normalizedCategory;

        List<Sweet> filtered = sweetRepository.findAll().stream()
                .filter(s -> {
                    // search filter (name)
                    if (search != null && !search.trim().isEmpty()) {
                        String q = search.trim().toLowerCase();
                        String name = s.getName() == null ? "" : s.getName().toLowerCase();
                        if (!name.contains(q)) {
                            return false;
                        }
                    }

                    // category handling
                    // - "all*" => match any category (no filtering)
                    // - "prefix*" => match categories starting with prefix (case-insensitive)
                    // - otherwise exact match (case-insensitive)
                    if (!"all*".equalsIgnoreCase(catFilter)) {
                        String sCategory = s.getCategory() == null ? "" : s.getCategory().trim();
                        if (catFilter.endsWith("*")) {
                            String prefix = catFilter.substring(0, catFilter.length() - 1).toLowerCase();
                            if (!sCategory.toLowerCase().startsWith(prefix))
                                return false;
                        } else {
                            if (!sCategory.equalsIgnoreCase(catFilter))
                                return false;
                        }
                    }

                    // price bounds (null-safe)
                    if (minPrice != null) {
                        Double p = s.getPrice();
                        if (p == null || p < minPrice)
                            return false;
                    }
                    if (maxPrice != null) {
                        Double p = s.getPrice();
                        if (p == null || p > maxPrice)
                            return false;
                    }

                    return true;
                })
                .collect(Collectors.toList());

        int total = filtered.size();
        int fromIndex = Math.max(0, (page - 1) * limit);
        int toIndex = Math.min(total, fromIndex + limit);
        List<Sweet> pageItems = fromIndex >= total ? Collections.emptyList() : filtered.subList(fromIndex, toIndex);

        Map<String, Object> resp = new HashMap<>();
        resp.put("items", pageItems);
        resp.put("total", total);
        return resp;
    }

    @CacheEvict(value = "sweets", allEntries = true)
    public Sweet addSweet(String name, String category, Double price) {
        Sweet s = new Sweet();
        s.setName(name);
        s.setCategory(category);
        s.setPrice(price);
        return sweetRepository.addSweet(s);
    }
}
