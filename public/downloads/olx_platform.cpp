/**
 * OLX-Style Classifieds Platform - C++ Logic Implementation
 * 
 * This file contains the core business logic of the classifieds platform
 * translated from the React/TypeScript web application.
 * 
 * Compile with: g++ -std=c++17 -o olx_platform olx_platform.cpp
 * Run with: ./olx_platform
 */

#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <optional>
#include <chrono>
#include <algorithm>
#include <iomanip>
#include <sstream>
#include <functional>

// ============================================================================
// ENUMS
// ============================================================================

enum class AdStatus {
    PENDING,
    APPROVED,
    REJECTED
};

enum class UserRole {
    USER,
    ADMIN
};

std::string adStatusToString(AdStatus status) {
    switch (status) {
        case AdStatus::PENDING: return "pending";
        case AdStatus::APPROVED: return "approved";
        case AdStatus::REJECTED: return "rejected";
        default: return "unknown";
    }
}

std::string userRoleToString(UserRole role) {
    switch (role) {
        case UserRole::USER: return "user";
        case UserRole::ADMIN: return "admin";
        default: return "unknown";
    }
}

// ============================================================================
// DATA MODELS
// ============================================================================

struct Category {
    std::string id;
    std::string name;
    std::string icon;
    std::string createdAt;
};

struct Profile {
    std::string id;
    std::string userId;
    std::string name;
    std::string phone;
    std::string avatarUrl;
    std::string createdAt;
};

struct Ad {
    std::string id;
    std::string userId;
    std::string categoryId;
    std::string title;
    std::string description;
    double price;
    std::string location;
    std::vector<std::string> images;
    AdStatus status;
    std::optional<std::string> rejectionReason;
    std::string createdAt;
    std::string updatedAt;
};

struct Favorite {
    std::string id;
    std::string userId;
    std::string adId;
    std::string createdAt;
};

struct Article {
    std::string id;
    std::string title;
    std::string slug;
    std::string excerpt;
    std::string content;
    std::string category;
    std::string thumbnailUrl;
    std::string publishedAt;
    std::string createdAt;
    std::string updatedAt;
};

struct User {
    std::string id;
    std::string email;
    UserRole role;
    Profile profile;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

std::string generateUUID() {
    static int counter = 0;
    std::stringstream ss;
    ss << "uuid-" << std::setfill('0') << std::setw(8) << ++counter;
    return ss.str();
}

std::string getCurrentTimestamp() {
    auto now = std::chrono::system_clock::now();
    auto time = std::chrono::system_clock::to_time_t(now);
    std::stringstream ss;
    ss << std::put_time(std::localtime(&time), "%Y-%m-%dT%H:%M:%S");
    return ss.str();
}

std::string slugify(const std::string& text) {
    std::string result;
    for (char c : text) {
        if (std::isalnum(c)) {
            result += std::tolower(c);
        } else if (c == ' ' && !result.empty() && result.back() != '-') {
            result += '-';
        }
    }
    return result;
}

// ============================================================================
// DATABASE SIMULATION
// ============================================================================

class Database {
private:
    std::vector<Category> categories;
    std::vector<Profile> profiles;
    std::vector<Ad> ads;
    std::vector<Favorite> favorites;
    std::vector<Article> articles;
    std::map<std::string, UserRole> userRoles;

public:
    Database() {
        // Initialize default categories
        categories = {
            {"cat-1", "Mobiles", "📱", getCurrentTimestamp()},
            {"cat-2", "Cars", "🚗", getCurrentTimestamp()},
            {"cat-3", "Bikes", "🏍️", getCurrentTimestamp()},
            {"cat-4", "Electronics", "💻", getCurrentTimestamp()},
            {"cat-5", "Property", "🏠", getCurrentTimestamp()}
        };
    }

    // ---- Category Operations ----
    std::vector<Category> getCategories() const {
        return categories;
    }

    std::optional<Category> getCategoryById(const std::string& id) const {
        auto it = std::find_if(categories.begin(), categories.end(),
            [&id](const Category& c) { return c.id == id; });
        if (it != categories.end()) return *it;
        return std::nullopt;
    }

    Category createCategory(const std::string& name, const std::string& icon) {
        Category cat{generateUUID(), name, icon, getCurrentTimestamp()};
        categories.push_back(cat);
        return cat;
    }

    bool deleteCategory(const std::string& id) {
        auto it = std::remove_if(categories.begin(), categories.end(),
            [&id](const Category& c) { return c.id == id; });
        if (it != categories.end()) {
            categories.erase(it, categories.end());
            return true;
        }
        return false;
    }

    // ---- Profile Operations ----
    Profile createProfile(const std::string& userId, const std::string& name, 
                         const std::string& phone = "") {
        Profile profile{generateUUID(), userId, name, phone, "", getCurrentTimestamp()};
        profiles.push_back(profile);
        return profile;
    }

    std::optional<Profile> getProfileByUserId(const std::string& userId) const {
        auto it = std::find_if(profiles.begin(), profiles.end(),
            [&userId](const Profile& p) { return p.userId == userId; });
        if (it != profiles.end()) return *it;
        return std::nullopt;
    }

    bool updateProfile(const std::string& userId, const std::string& name, 
                      const std::string& phone) {
        auto it = std::find_if(profiles.begin(), profiles.end(),
            [&userId](Profile& p) { return p.userId == userId; });
        if (it != profiles.end()) {
            it->name = name;
            it->phone = phone;
            return true;
        }
        return false;
    }

    // ---- Ad Operations ----
    Ad createAd(const std::string& userId, const std::string& categoryId,
                const std::string& title, const std::string& description,
                double price, const std::string& location = "",
                const std::vector<std::string>& images = {}) {
        Ad ad{
            generateUUID(), userId, categoryId, title, description,
            price, location, images, AdStatus::PENDING, std::nullopt,
            getCurrentTimestamp(), getCurrentTimestamp()
        };
        ads.push_back(ad);
        return ad;
    }

    std::vector<Ad> getAds(AdStatus status = AdStatus::APPROVED) const {
        std::vector<Ad> result;
        std::copy_if(ads.begin(), ads.end(), std::back_inserter(result),
            [status](const Ad& a) { return a.status == status; });
        return result;
    }

    std::vector<Ad> getAdsByCategory(const std::string& categoryId, 
                                     AdStatus status = AdStatus::APPROVED) const {
        std::vector<Ad> result;
        std::copy_if(ads.begin(), ads.end(), std::back_inserter(result),
            [&categoryId, status](const Ad& a) { 
                return a.categoryId == categoryId && a.status == status; 
            });
        return result;
    }

    std::vector<Ad> getAdsByUser(const std::string& userId) const {
        std::vector<Ad> result;
        std::copy_if(ads.begin(), ads.end(), std::back_inserter(result),
            [&userId](const Ad& a) { return a.userId == userId; });
        return result;
    }

    std::vector<Ad> searchAds(const std::string& query) const {
        std::vector<Ad> result;
        std::string lowerQuery = query;
        std::transform(lowerQuery.begin(), lowerQuery.end(), lowerQuery.begin(), ::tolower);
        
        std::copy_if(ads.begin(), ads.end(), std::back_inserter(result),
            [&lowerQuery](const Ad& a) {
                if (a.status != AdStatus::APPROVED) return false;
                std::string lowerTitle = a.title;
                std::transform(lowerTitle.begin(), lowerTitle.end(), lowerTitle.begin(), ::tolower);
                return lowerTitle.find(lowerQuery) != std::string::npos;
            });
        return result;
    }

    std::optional<Ad> getAdById(const std::string& id) const {
        auto it = std::find_if(ads.begin(), ads.end(),
            [&id](const Ad& a) { return a.id == id; });
        if (it != ads.end()) return *it;
        return std::nullopt;
    }

    bool approveAd(const std::string& id) {
        auto it = std::find_if(ads.begin(), ads.end(),
            [&id](Ad& a) { return a.id == id; });
        if (it != ads.end()) {
            it->status = AdStatus::APPROVED;
            it->updatedAt = getCurrentTimestamp();
            return true;
        }
        return false;
    }

    bool rejectAd(const std::string& id, const std::string& reason) {
        auto it = std::find_if(ads.begin(), ads.end(),
            [&id](Ad& a) { return a.id == id; });
        if (it != ads.end()) {
            it->status = AdStatus::REJECTED;
            it->rejectionReason = reason;
            it->updatedAt = getCurrentTimestamp();
            return true;
        }
        return false;
    }

    bool deleteAd(const std::string& id) {
        auto it = std::remove_if(ads.begin(), ads.end(),
            [&id](const Ad& a) { return a.id == id; });
        if (it != ads.end()) {
            ads.erase(it, ads.end());
            return true;
        }
        return false;
    }

    // ---- Favorites Operations ----
    Favorite addFavorite(const std::string& userId, const std::string& adId) {
        // Check if already exists
        auto existing = std::find_if(favorites.begin(), favorites.end(),
            [&userId, &adId](const Favorite& f) { 
                return f.userId == userId && f.adId == adId; 
            });
        if (existing != favorites.end()) return *existing;

        Favorite fav{generateUUID(), userId, adId, getCurrentTimestamp()};
        favorites.push_back(fav);
        return fav;
    }

    bool removeFavorite(const std::string& userId, const std::string& adId) {
        auto it = std::remove_if(favorites.begin(), favorites.end(),
            [&userId, &adId](const Favorite& f) { 
                return f.userId == userId && f.adId == adId; 
            });
        if (it != favorites.end()) {
            favorites.erase(it, favorites.end());
            return true;
        }
        return false;
    }

    std::vector<Ad> getUserFavorites(const std::string& userId) const {
        std::vector<Ad> result;
        for (const auto& fav : favorites) {
            if (fav.userId == userId) {
                auto ad = getAdById(fav.adId);
                if (ad.has_value()) {
                    result.push_back(ad.value());
                }
            }
        }
        return result;
    }

    bool isFavorite(const std::string& userId, const std::string& adId) const {
        return std::any_of(favorites.begin(), favorites.end(),
            [&userId, &adId](const Favorite& f) { 
                return f.userId == userId && f.adId == adId; 
            });
    }

    // ---- Article Operations ----
    Article createArticle(const std::string& title, const std::string& excerpt,
                         const std::string& content, const std::string& category,
                         const std::string& thumbnailUrl = "") {
        Article article{
            generateUUID(), title, slugify(title), excerpt, content,
            category, thumbnailUrl, getCurrentTimestamp(),
            getCurrentTimestamp(), getCurrentTimestamp()
        };
        articles.push_back(article);
        return article;
    }

    std::vector<Article> getArticles() const {
        return articles;
    }

    std::vector<Article> getArticlesByCategory(const std::string& category) const {
        std::vector<Article> result;
        std::copy_if(articles.begin(), articles.end(), std::back_inserter(result),
            [&category](const Article& a) { return a.category == category; });
        return result;
    }

    std::optional<Article> getArticleBySlug(const std::string& slug) const {
        auto it = std::find_if(articles.begin(), articles.end(),
            [&slug](const Article& a) { return a.slug == slug; });
        if (it != articles.end()) return *it;
        return std::nullopt;
    }

    std::vector<Article> searchArticles(const std::string& query) const {
        std::vector<Article> result;
        std::string lowerQuery = query;
        std::transform(lowerQuery.begin(), lowerQuery.end(), lowerQuery.begin(), ::tolower);
        
        std::copy_if(articles.begin(), articles.end(), std::back_inserter(result),
            [&lowerQuery](const Article& a) {
                std::string lowerTitle = a.title;
                std::transform(lowerTitle.begin(), lowerTitle.end(), lowerTitle.begin(), ::tolower);
                return lowerTitle.find(lowerQuery) != std::string::npos;
            });
        return result;
    }

    bool deleteArticle(const std::string& id) {
        auto it = std::remove_if(articles.begin(), articles.end(),
            [&id](const Article& a) { return a.id == id; });
        if (it != articles.end()) {
            articles.erase(it, articles.end());
            return true;
        }
        return false;
    }

    // ---- User Role Operations ----
    void setUserRole(const std::string& userId, UserRole role) {
        userRoles[userId] = role;
    }

    bool isAdmin(const std::string& userId) const {
        auto it = userRoles.find(userId);
        return it != userRoles.end() && it->second == UserRole::ADMIN;
    }

    UserRole getUserRole(const std::string& userId) const {
        auto it = userRoles.find(userId);
        if (it != userRoles.end()) return it->second;
        return UserRole::USER;
    }

    // ---- Statistics ----
    struct Statistics {
        size_t totalAds;
        size_t pendingAds;
        size_t approvedAds;
        size_t rejectedAds;
        size_t totalUsers;
        size_t totalArticles;
        size_t totalCategories;
    };

    Statistics getStatistics() const {
        Statistics stats;
        stats.totalAds = ads.size();
        stats.pendingAds = std::count_if(ads.begin(), ads.end(),
            [](const Ad& a) { return a.status == AdStatus::PENDING; });
        stats.approvedAds = std::count_if(ads.begin(), ads.end(),
            [](const Ad& a) { return a.status == AdStatus::APPROVED; });
        stats.rejectedAds = std::count_if(ads.begin(), ads.end(),
            [](const Ad& a) { return a.status == AdStatus::REJECTED; });
        stats.totalUsers = profiles.size();
        stats.totalArticles = articles.size();
        stats.totalCategories = categories.size();
        return stats;
    }
};

// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================

class AuthService {
private:
    Database& db;
    std::optional<std::string> currentUserId;

public:
    AuthService(Database& database) : db(database) {}

    bool signUp(const std::string& email, const std::string& name) {
        std::string userId = generateUUID();
        db.createProfile(userId, name);
        db.setUserRole(userId, UserRole::USER);
        currentUserId = userId;
        std::cout << "✅ User signed up successfully: " << email << std::endl;
        return true;
    }

    bool signIn(const std::string& userId) {
        auto profile = db.getProfileByUserId(userId);
        if (profile.has_value()) {
            currentUserId = userId;
            std::cout << "✅ User signed in: " << profile->name << std::endl;
            return true;
        }
        return false;
    }

    void signOut() {
        currentUserId = std::nullopt;
        std::cout << "✅ User signed out" << std::endl;
    }

    bool isAuthenticated() const {
        return currentUserId.has_value();
    }

    std::optional<std::string> getCurrentUserId() const {
        return currentUserId;
    }

    bool isAdmin() const {
        if (!currentUserId.has_value()) return false;
        return db.isAdmin(currentUserId.value());
    }
};

// ============================================================================
// DEMO & TESTING
// ============================================================================

void printSeparator(const std::string& title) {
    std::cout << "\n" << std::string(60, '=') << std::endl;
    std::cout << "  " << title << std::endl;
    std::cout << std::string(60, '=') << std::endl;
}

void runDemo() {
    Database db;
    AuthService auth(db);

    printSeparator("OLX PLATFORM - C++ DEMO");

    // 1. Display categories
    printSeparator("CATEGORIES");
    for (const auto& cat : db.getCategories()) {
        std::cout << "  " << cat.icon << " " << cat.name << " (ID: " << cat.id << ")" << std::endl;
    }

    // 2. User signup
    printSeparator("USER REGISTRATION");
    auth.signUp("john@example.com", "John Doe");
    std::string userId1 = auth.getCurrentUserId().value();
    
    auth.signUp("admin@example.com", "Admin User");
    std::string adminId = auth.getCurrentUserId().value();
    db.setUserRole(adminId, UserRole::ADMIN);
    std::cout << "  Admin role assigned to: " << adminId << std::endl;

    // 3. Create ads
    printSeparator("CREATING ADS");
    auth.signIn(userId1);
    
    auto ad1 = db.createAd(userId1, "cat-1", "iPhone 15 Pro Max", 
        "Brand new, sealed box, 256GB", 450000, "Karachi");
    std::cout << "  Created: " << ad1.title << " - PKR " << ad1.price << std::endl;
    
    auto ad2 = db.createAd(userId1, "cat-2", "Toyota Corolla 2020",
        "Low mileage, excellent condition", 5500000, "Lahore");
    std::cout << "  Created: " << ad2.title << " - PKR " << ad2.price << std::endl;
    
    auto ad3 = db.createAd(userId1, "cat-4", "Gaming Laptop RTX 4080",
        "Perfect for gaming and work", 350000, "Islamabad");
    std::cout << "  Created: " << ad3.title << " - PKR " << ad3.price << std::endl;

    // 4. Admin moderation
    printSeparator("ADMIN MODERATION");
    auth.signIn(adminId);
    
    if (auth.isAdmin()) {
        std::cout << "  ✓ User is admin, proceeding with moderation..." << std::endl;
        
        db.approveAd(ad1.id);
        std::cout << "  Approved: " << ad1.title << std::endl;
        
        db.approveAd(ad2.id);
        std::cout << "  Approved: " << ad2.title << std::endl;
        
        db.rejectAd(ad3.id, "Price seems too low for this product");
        std::cout << "  Rejected: " << ad3.title << std::endl;
    }

    // 5. Browse approved ads
    printSeparator("APPROVED ADS");
    for (const auto& ad : db.getAds(AdStatus::APPROVED)) {
        std::cout << "  📦 " << ad.title << std::endl;
        std::cout << "     Price: PKR " << std::fixed << std::setprecision(0) << ad.price << std::endl;
        std::cout << "     Location: " << ad.location << std::endl;
        std::cout << "     Status: " << adStatusToString(ad.status) << std::endl;
        std::cout << std::endl;
    }

    // 6. Search functionality
    printSeparator("SEARCH: 'iphone'");
    auto searchResults = db.searchAds("iphone");
    std::cout << "  Found " << searchResults.size() << " result(s):" << std::endl;
    for (const auto& ad : searchResults) {
        std::cout << "  - " << ad.title << " (PKR " << ad.price << ")" << std::endl;
    }

    // 7. Favorites
    printSeparator("FAVORITES");
    auth.signIn(userId1);
    db.addFavorite(userId1, ad1.id);
    std::cout << "  Added to favorites: " << ad1.title << std::endl;
    std::cout << "  Is favorite? " << (db.isFavorite(userId1, ad1.id) ? "Yes" : "No") << std::endl;

    // 8. Articles/News
    printSeparator("NEWS ARTICLES");
    auto article1 = db.createArticle(
        "New Technology Trends 2024",
        "Explore the latest tech innovations...",
        "Full article content here...",
        "Technology"
    );
    std::cout << "  Created article: " << article1.title << std::endl;
    std::cout << "  Slug: " << article1.slug << std::endl;

    auto article2 = db.createArticle(
        "Best Cars to Buy This Year",
        "Our top picks for automobiles...",
        "Full article content here...",
        "Automotive"
    );
    std::cout << "  Created article: " << article2.title << std::endl;

    // 9. Statistics
    printSeparator("PLATFORM STATISTICS");
    auto stats = db.getStatistics();
    std::cout << "  Total Ads: " << stats.totalAds << std::endl;
    std::cout << "    - Pending: " << stats.pendingAds << std::endl;
    std::cout << "    - Approved: " << stats.approvedAds << std::endl;
    std::cout << "    - Rejected: " << stats.rejectedAds << std::endl;
    std::cout << "  Total Users: " << stats.totalUsers << std::endl;
    std::cout << "  Total Articles: " << stats.totalArticles << std::endl;
    std::cout << "  Total Categories: " << stats.totalCategories << std::endl;

    printSeparator("DEMO COMPLETE");
    std::cout << "\nThis C++ implementation mirrors the logic of the React/TypeScript" << std::endl;
    std::cout << "web application, including:" << std::endl;
    std::cout << "  • User authentication & roles" << std::endl;
    std::cout << "  • Ad creation, moderation & search" << std::endl;
    std::cout << "  • Category management" << std::endl;
    std::cout << "  • Favorites system" << std::endl;
    std::cout << "  • News/Articles section" << std::endl;
    std::cout << "  • Admin dashboard statistics" << std::endl;
}

int main() {
    runDemo();
    return 0;
}
