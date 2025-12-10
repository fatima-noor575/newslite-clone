/**
 * ProPakistani News Clone - C++ Logic Implementation
 * 
 * This file contains the core business logic of a news website platform
 * similar to ProPakistani, translated from the React/TypeScript web application.
 * 
 * Compile with: g++ -std=c++17 -o propakistani_clone propakistani_clone.cpp
 * Run with: ./propakistani_clone
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
#include <set>

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

enum class ArticleStatus {
    DRAFT,
    PUBLISHED,
    ARCHIVED
};

enum class UserRole {
    READER,
    AUTHOR,
    EDITOR,
    ADMIN
};

const std::vector<std::string> NEWS_CATEGORIES = {
    "Technology",
    "Mobile",
    "Telecom",
    "Reviews",
    "Apps",
    "Startups",
    "Policy",
    "Security",
    "Science",
    "Gaming"
};

std::string articleStatusToString(ArticleStatus status) {
    switch (status) {
        case ArticleStatus::DRAFT: return "draft";
        case ArticleStatus::PUBLISHED: return "published";
        case ArticleStatus::ARCHIVED: return "archived";
        default: return "unknown";
    }
}

std::string userRoleToString(UserRole role) {
    switch (role) {
        case UserRole::READER: return "reader";
        case UserRole::AUTHOR: return "author";
        case UserRole::EDITOR: return "editor";
        case UserRole::ADMIN: return "admin";
        default: return "unknown";
    }
}

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

std::string formatDate(const std::string& timestamp) {
    // Simple date formatting - returns just the date part
    if (timestamp.length() >= 10) {
        return timestamp.substr(0, 10);
    }
    return timestamp;
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
    // Remove trailing dash
    while (!result.empty() && result.back() == '-') {
        result.pop_back();
    }
    return result;
}

std::string truncateText(const std::string& text, size_t maxLength) {
    if (text.length() <= maxLength) return text;
    return text.substr(0, maxLength - 3) + "...";
}

std::string toLowerCase(const std::string& str) {
    std::string result = str;
    std::transform(result.begin(), result.end(), result.begin(), ::tolower);
    return result;
}

// ============================================================================
// DATA MODELS
// ============================================================================

struct Category {
    std::string id;
    std::string name;
    std::string slug;
    std::string description;
    std::string icon;
    int articleCount;
    std::string createdAt;
};

struct Author {
    std::string id;
    std::string name;
    std::string email;
    std::string bio;
    std::string avatarUrl;
    std::string twitter;
    int articleCount;
    std::string createdAt;
};

struct Article {
    std::string id;
    std::string title;
    std::string slug;
    std::string excerpt;
    std::string content;
    std::string category;
    std::string authorId;
    std::string thumbnailUrl;
    std::vector<std::string> tags;
    ArticleStatus status;
    int viewCount;
    std::string publishedAt;
    std::string createdAt;
    std::string updatedAt;
};

struct Comment {
    std::string id;
    std::string articleId;
    std::string userId;
    std::string userName;
    std::string content;
    int likes;
    std::string createdAt;
};

struct User {
    std::string id;
    std::string email;
    std::string name;
    UserRole role;
    std::vector<std::string> bookmarkedArticles;
    std::string createdAt;
};

struct NewsletterSubscriber {
    std::string id;
    std::string email;
    bool isActive;
    std::string subscribedAt;
};

// ============================================================================
// NEWS DATABASE
// ============================================================================

class NewsDatabase {
private:
    std::vector<Category> categories;
    std::vector<Author> authors;
    std::vector<Article> articles;
    std::vector<Comment> comments;
    std::vector<User> users;
    std::vector<NewsletterSubscriber> subscribers;

public:
    NewsDatabase() {
        initializeCategories();
    }

    void initializeCategories() {
        for (const auto& catName : NEWS_CATEGORIES) {
            categories.push_back({
                generateUUID(),
                catName,
                slugify(catName),
                "Latest " + catName + " news and updates",
                "📰",
                0,
                getCurrentTimestamp()
            });
        }
    }

    // ---- Category Operations ----
    std::vector<Category> getCategories() const {
        return categories;
    }

    std::optional<Category> getCategoryBySlug(const std::string& slug) const {
        auto it = std::find_if(categories.begin(), categories.end(),
            [&slug](const Category& c) { return c.slug == slug; });
        if (it != categories.end()) return *it;
        return std::nullopt;
    }

    Category createCategory(const std::string& name, const std::string& description) {
        Category cat{
            generateUUID(), name, slugify(name), description,
            "📰", 0, getCurrentTimestamp()
        };
        categories.push_back(cat);
        return cat;
    }

    // ---- Author Operations ----
    Author createAuthor(const std::string& name, const std::string& email,
                       const std::string& bio = "") {
        Author author{
            generateUUID(), name, email, bio, "", "", 0, getCurrentTimestamp()
        };
        authors.push_back(author);
        return author;
    }

    std::optional<Author> getAuthorById(const std::string& id) const {
        auto it = std::find_if(authors.begin(), authors.end(),
            [&id](const Author& a) { return a.id == id; });
        if (it != authors.end()) return *it;
        return std::nullopt;
    }

    std::vector<Author> getAuthors() const {
        return authors;
    }

    // ---- Article Operations ----
    Article createArticle(const std::string& title, const std::string& excerpt,
                         const std::string& content, const std::string& category,
                         const std::string& authorId,
                         const std::vector<std::string>& tags = {},
                         const std::string& thumbnailUrl = "") {
        Article article{
            generateUUID(),
            title,
            slugify(title),
            excerpt,
            content,
            category,
            authorId,
            thumbnailUrl,
            tags,
            ArticleStatus::DRAFT,
            0,
            "",
            getCurrentTimestamp(),
            getCurrentTimestamp()
        };
        articles.push_back(article);
        
        // Update author article count
        auto authorIt = std::find_if(authors.begin(), authors.end(),
            [&authorId](Author& a) { return a.id == authorId; });
        if (authorIt != authors.end()) {
            authorIt->articleCount++;
        }
        
        return article;
    }

    bool publishArticle(const std::string& id) {
        auto it = std::find_if(articles.begin(), articles.end(),
            [&id](Article& a) { return a.id == id; });
        if (it != articles.end()) {
            it->status = ArticleStatus::PUBLISHED;
            it->publishedAt = getCurrentTimestamp();
            it->updatedAt = getCurrentTimestamp();
            
            // Update category article count
            auto catIt = std::find_if(categories.begin(), categories.end(),
                [&it](Category& c) { return c.name == it->category; });
            if (catIt != categories.end()) {
                catIt->articleCount++;
            }
            return true;
        }
        return false;
    }

    bool archiveArticle(const std::string& id) {
        auto it = std::find_if(articles.begin(), articles.end(),
            [&id](Article& a) { return a.id == id; });
        if (it != articles.end()) {
            it->status = ArticleStatus::ARCHIVED;
            it->updatedAt = getCurrentTimestamp();
            return true;
        }
        return false;
    }

    std::vector<Article> getPublishedArticles(int limit = 50) const {
        std::vector<Article> result;
        for (const auto& article : articles) {
            if (article.status == ArticleStatus::PUBLISHED) {
                result.push_back(article);
                if (result.size() >= static_cast<size_t>(limit)) break;
            }
        }
        // Sort by publishedAt descending (newest first)
        std::sort(result.begin(), result.end(),
            [](const Article& a, const Article& b) {
                return a.publishedAt > b.publishedAt;
            });
        return result;
    }

    std::vector<Article> getArticlesByCategory(const std::string& category, 
                                               int limit = 20) const {
        std::vector<Article> result;
        for (const auto& article : articles) {
            if (article.status == ArticleStatus::PUBLISHED && 
                article.category == category) {
                result.push_back(article);
                if (result.size() >= static_cast<size_t>(limit)) break;
            }
        }
        std::sort(result.begin(), result.end(),
            [](const Article& a, const Article& b) {
                return a.publishedAt > b.publishedAt;
            });
        return result;
    }

    std::vector<Article> getArticlesByAuthor(const std::string& authorId) const {
        std::vector<Article> result;
        std::copy_if(articles.begin(), articles.end(), std::back_inserter(result),
            [&authorId](const Article& a) { 
                return a.authorId == authorId && 
                       a.status == ArticleStatus::PUBLISHED; 
            });
        return result;
    }

    std::optional<Article> getArticleBySlug(const std::string& slug) const {
        auto it = std::find_if(articles.begin(), articles.end(),
            [&slug](const Article& a) { 
                return a.slug == slug && a.status == ArticleStatus::PUBLISHED; 
            });
        if (it != articles.end()) return *it;
        return std::nullopt;
    }

    std::optional<Article> getArticleById(const std::string& id) const {
        auto it = std::find_if(articles.begin(), articles.end(),
            [&id](const Article& a) { return a.id == id; });
        if (it != articles.end()) return *it;
        return std::nullopt;
    }

    bool incrementViewCount(const std::string& id) {
        auto it = std::find_if(articles.begin(), articles.end(),
            [&id](Article& a) { return a.id == id; });
        if (it != articles.end()) {
            it->viewCount++;
            return true;
        }
        return false;
    }

    std::vector<Article> searchArticles(const std::string& query) const {
        std::vector<Article> result;
        std::string lowerQuery = toLowerCase(query);
        
        for (const auto& article : articles) {
            if (article.status != ArticleStatus::PUBLISHED) continue;
            
            std::string lowerTitle = toLowerCase(article.title);
            std::string lowerExcerpt = toLowerCase(article.excerpt);
            std::string lowerContent = toLowerCase(article.content);
            
            if (lowerTitle.find(lowerQuery) != std::string::npos ||
                lowerExcerpt.find(lowerQuery) != std::string::npos ||
                lowerContent.find(lowerQuery) != std::string::npos) {
                result.push_back(article);
            }
        }
        return result;
    }

    std::vector<Article> getArticlesByTag(const std::string& tag) const {
        std::vector<Article> result;
        std::string lowerTag = toLowerCase(tag);
        
        for (const auto& article : articles) {
            if (article.status != ArticleStatus::PUBLISHED) continue;
            
            for (const auto& t : article.tags) {
                if (toLowerCase(t) == lowerTag) {
                    result.push_back(article);
                    break;
                }
            }
        }
        return result;
    }

    std::vector<Article> getTrendingArticles(int limit = 10) const {
        std::vector<Article> published = getPublishedArticles(100);
        std::sort(published.begin(), published.end(),
            [](const Article& a, const Article& b) {
                return a.viewCount > b.viewCount;
            });
        if (published.size() > static_cast<size_t>(limit)) {
            published.resize(limit);
        }
        return published;
    }

    std::vector<Article> getRelatedArticles(const std::string& articleId, 
                                            int limit = 5) const {
        auto article = getArticleById(articleId);
        if (!article.has_value()) return {};
        
        std::vector<Article> result;
        for (const auto& a : articles) {
            if (a.id == articleId) continue;
            if (a.status != ArticleStatus::PUBLISHED) continue;
            if (a.category == article->category) {
                result.push_back(a);
                if (result.size() >= static_cast<size_t>(limit)) break;
            }
        }
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

    bool updateArticle(const std::string& id, const std::string& title,
                      const std::string& excerpt, const std::string& content) {
        auto it = std::find_if(articles.begin(), articles.end(),
            [&id](Article& a) { return a.id == id; });
        if (it != articles.end()) {
            it->title = title;
            it->slug = slugify(title);
            it->excerpt = excerpt;
            it->content = content;
            it->updatedAt = getCurrentTimestamp();
            return true;
        }
        return false;
    }

    // ---- Comment Operations ----
    Comment addComment(const std::string& articleId, const std::string& userId,
                      const std::string& userName, const std::string& content) {
        Comment comment{
            generateUUID(), articleId, userId, userName, content, 0,
            getCurrentTimestamp()
        };
        comments.push_back(comment);
        return comment;
    }

    std::vector<Comment> getArticleComments(const std::string& articleId) const {
        std::vector<Comment> result;
        std::copy_if(comments.begin(), comments.end(), std::back_inserter(result),
            [&articleId](const Comment& c) { return c.articleId == articleId; });
        return result;
    }

    bool likeComment(const std::string& commentId) {
        auto it = std::find_if(comments.begin(), comments.end(),
            [&commentId](Comment& c) { return c.id == commentId; });
        if (it != comments.end()) {
            it->likes++;
            return true;
        }
        return false;
    }

    // ---- User Operations ----
    User createUser(const std::string& email, const std::string& name,
                   UserRole role = UserRole::READER) {
        User user{
            generateUUID(), email, name, role, {}, getCurrentTimestamp()
        };
        users.push_back(user);
        return user;
    }

    std::optional<User> getUserById(const std::string& id) const {
        auto it = std::find_if(users.begin(), users.end(),
            [&id](const User& u) { return u.id == id; });
        if (it != users.end()) return *it;
        return std::nullopt;
    }

    bool bookmarkArticle(const std::string& userId, const std::string& articleId) {
        auto it = std::find_if(users.begin(), users.end(),
            [&userId](User& u) { return u.id == userId; });
        if (it != users.end()) {
            // Check if already bookmarked
            auto bookmarkIt = std::find(it->bookmarkedArticles.begin(),
                                       it->bookmarkedArticles.end(), articleId);
            if (bookmarkIt == it->bookmarkedArticles.end()) {
                it->bookmarkedArticles.push_back(articleId);
            }
            return true;
        }
        return false;
    }

    bool removeBookmark(const std::string& userId, const std::string& articleId) {
        auto it = std::find_if(users.begin(), users.end(),
            [&userId](User& u) { return u.id == userId; });
        if (it != users.end()) {
            auto bookmarkIt = std::remove(it->bookmarkedArticles.begin(),
                                         it->bookmarkedArticles.end(), articleId);
            if (bookmarkIt != it->bookmarkedArticles.end()) {
                it->bookmarkedArticles.erase(bookmarkIt, it->bookmarkedArticles.end());
                return true;
            }
        }
        return false;
    }

    std::vector<Article> getUserBookmarks(const std::string& userId) const {
        std::vector<Article> result;
        auto user = getUserById(userId);
        if (!user.has_value()) return result;
        
        for (const auto& articleId : user->bookmarkedArticles) {
            auto article = getArticleById(articleId);
            if (article.has_value()) {
                result.push_back(article.value());
            }
        }
        return result;
    }

    // ---- Newsletter Operations ----
    bool subscribeNewsletter(const std::string& email) {
        // Check if already subscribed
        auto it = std::find_if(subscribers.begin(), subscribers.end(),
            [&email](const NewsletterSubscriber& s) { return s.email == email; });
        if (it != subscribers.end()) {
            it->isActive = true;
            return true;
        }
        
        subscribers.push_back({
            generateUUID(), email, true, getCurrentTimestamp()
        });
        return true;
    }

    bool unsubscribeNewsletter(const std::string& email) {
        auto it = std::find_if(subscribers.begin(), subscribers.end(),
            [&email](NewsletterSubscriber& s) { return s.email == email; });
        if (it != subscribers.end()) {
            it->isActive = false;
            return true;
        }
        return false;
    }

    std::vector<NewsletterSubscriber> getActiveSubscribers() const {
        std::vector<NewsletterSubscriber> result;
        std::copy_if(subscribers.begin(), subscribers.end(), std::back_inserter(result),
            [](const NewsletterSubscriber& s) { return s.isActive; });
        return result;
    }

    // ---- Statistics ----
    struct Statistics {
        size_t totalArticles;
        size_t publishedArticles;
        size_t draftArticles;
        size_t totalAuthors;
        size_t totalCategories;
        size_t totalUsers;
        size_t totalComments;
        size_t totalSubscribers;
        size_t totalViews;
    };

    Statistics getStatistics() const {
        Statistics stats{};
        stats.totalArticles = articles.size();
        stats.publishedArticles = std::count_if(articles.begin(), articles.end(),
            [](const Article& a) { return a.status == ArticleStatus::PUBLISHED; });
        stats.draftArticles = std::count_if(articles.begin(), articles.end(),
            [](const Article& a) { return a.status == ArticleStatus::DRAFT; });
        stats.totalAuthors = authors.size();
        stats.totalCategories = categories.size();
        stats.totalUsers = users.size();
        stats.totalComments = comments.size();
        stats.totalSubscribers = std::count_if(subscribers.begin(), subscribers.end(),
            [](const NewsletterSubscriber& s) { return s.isActive; });
        stats.totalViews = 0;
        for (const auto& a : articles) {
            stats.totalViews += a.viewCount;
        }
        return stats;
    }

    // ---- Admin Operations ----
    std::vector<Article> getAllArticles() const {
        return articles;
    }

    std::vector<User> getAllUsers() const {
        return users;
    }
};

// ============================================================================
// SEARCH SERVICE
// ============================================================================

class SearchService {
private:
    NewsDatabase& db;

public:
    SearchService(NewsDatabase& database) : db(database) {}

    struct SearchResult {
        std::vector<Article> articles;
        std::string query;
        int totalResults;
        double searchTime; // in milliseconds
    };

    SearchResult search(const std::string& query) {
        auto start = std::chrono::high_resolution_clock::now();
        
        auto results = db.searchArticles(query);
        
        auto end = std::chrono::high_resolution_clock::now();
        std::chrono::duration<double, std::milli> duration = end - start;
        
        return {
            results,
            query,
            static_cast<int>(results.size()),
            duration.count()
        };
    }
};

// ============================================================================
// FEED SERVICE
// ============================================================================

class FeedService {
private:
    NewsDatabase& db;

public:
    FeedService(NewsDatabase& database) : db(database) {}

    struct HomeFeed {
        std::vector<Article> featured;      // Top 3 articles
        std::vector<Article> latest;        // Latest 10 articles
        std::vector<Article> trending;      // Most viewed
        std::map<std::string, std::vector<Article>> byCategory;
    };

    HomeFeed getHomeFeed() {
        HomeFeed feed;
        
        auto allArticles = db.getPublishedArticles(50);
        
        // Featured (top 3)
        if (allArticles.size() >= 3) {
            feed.featured = std::vector<Article>(allArticles.begin(), allArticles.begin() + 3);
        } else {
            feed.featured = allArticles;
        }
        
        // Latest (next 10)
        if (allArticles.size() > 3) {
            size_t end = std::min(allArticles.size(), size_t(13));
            feed.latest = std::vector<Article>(allArticles.begin() + 3, allArticles.begin() + end);
        }
        
        // Trending
        feed.trending = db.getTrendingArticles(5);
        
        // By category
        for (const auto& cat : db.getCategories()) {
            auto catArticles = db.getArticlesByCategory(cat.name, 5);
            if (!catArticles.empty()) {
                feed.byCategory[cat.name] = catArticles;
            }
        }
        
        return feed;
    }
};

// ============================================================================
// DEMO & TESTING
// ============================================================================

void printSeparator(const std::string& title) {
    std::cout << "\n" << std::string(70, '=') << std::endl;
    std::cout << "  " << title << std::endl;
    std::cout << std::string(70, '=') << std::endl;
}

void printArticle(const Article& article, bool showContent = false) {
    std::cout << "\n  📰 " << article.title << std::endl;
    std::cout << "     Category: " << article.category << std::endl;
    std::cout << "     Slug: " << article.slug << std::endl;
    std::cout << "     Excerpt: " << truncateText(article.excerpt, 60) << std::endl;
    std::cout << "     Views: " << article.viewCount << std::endl;
    std::cout << "     Status: " << articleStatusToString(article.status) << std::endl;
    if (!article.publishedAt.empty()) {
        std::cout << "     Published: " << formatDate(article.publishedAt) << std::endl;
    }
    if (!article.tags.empty()) {
        std::cout << "     Tags: ";
        for (size_t i = 0; i < article.tags.size(); i++) {
            std::cout << article.tags[i];
            if (i < article.tags.size() - 1) std::cout << ", ";
        }
        std::cout << std::endl;
    }
    if (showContent) {
        std::cout << "     Content: " << truncateText(article.content, 100) << std::endl;
    }
}

void runDemo() {
    NewsDatabase db;
    SearchService searchService(db);
    FeedService feedService(db);

    printSeparator("PROPAKISTANI NEWS CLONE - C++ DEMO");

    // 1. Display categories
    printSeparator("NEWS CATEGORIES");
    for (const auto& cat : db.getCategories()) {
        std::cout << "  " << cat.icon << " " << cat.name 
                  << " (" << cat.slug << ")" << std::endl;
    }

    // 2. Create authors
    printSeparator("AUTHORS");
    auto author1 = db.createAuthor("Ali Hassan", "ali@propakistani.pk",
        "Senior Technology Reporter covering mobile and telecom industry");
    std::cout << "  ✓ Created author: " << author1.name << std::endl;
    
    auto author2 = db.createAuthor("Sara Khan", "sara@propakistani.pk",
        "Startup ecosystem and fintech specialist");
    std::cout << "  ✓ Created author: " << author2.name << std::endl;
    
    auto author3 = db.createAuthor("Ahmed Malik", "ahmed@propakistani.pk",
        "Policy and regulation analyst");
    std::cout << "  ✓ Created author: " << author3.name << std::endl;

    // 3. Create and publish articles
    printSeparator("CREATING ARTICLES");
    
    auto article1 = db.createArticle(
        "Jazz Launches 5G Network in Major Cities",
        "Jazz becomes first operator to launch commercial 5G services in Pakistan",
        "In a landmark development for Pakistan's telecommunications sector, Jazz has "
        "officially launched its 5G network in Islamabad, Lahore, and Karachi. The rollout "
        "marks Pakistan's entry into the fifth generation of mobile networks...",
        "Telecom",
        author1.id,
        {"5G", "Jazz", "Telecom", "Pakistan"},
        "https://example.com/jazz-5g.jpg"
    );
    db.publishArticle(article1.id);
    std::cout << "  ✓ Published: " << article1.title << std::endl;

    auto article2 = db.createArticle(
        "Xiaomi 14 Ultra Review: Camera Beast Arrives in Pakistan",
        "We test the latest flagship smartphone from Xiaomi with Leica cameras",
        "The Xiaomi 14 Ultra has finally arrived in Pakistan, bringing with it a "
        "revolutionary camera system developed in partnership with Leica. Our comprehensive "
        "review puts this flagship through its paces...",
        "Reviews",
        author1.id,
        {"Xiaomi", "Smartphone", "Review", "Camera"},
        "https://example.com/xiaomi-14.jpg"
    );
    db.publishArticle(article2.id);
    db.incrementViewCount(article2.id);
    db.incrementViewCount(article2.id);
    db.incrementViewCount(article2.id);
    std::cout << "  ✓ Published: " << article2.title << std::endl;

    auto article3 = db.createArticle(
        "Pakistani Fintech Startup Raises $25M in Series B",
        "SadaPay secures major funding round led by international investors",
        "SadaPay, Pakistan's leading digital banking platform, has announced a successful "
        "$25 million Series B funding round. The investment was led by Sequoia Capital with "
        "participation from existing investors...",
        "Startups",
        author2.id,
        {"SadaPay", "Fintech", "Funding", "Startup"},
        "https://example.com/sadapay.jpg"
    );
    db.publishArticle(article3.id);
    db.incrementViewCount(article3.id);
    db.incrementViewCount(article3.id);
    std::cout << "  ✓ Published: " << article3.title << std::endl;

    auto article4 = db.createArticle(
        "PTA Issues New Guidelines for Social Media Companies",
        "New regulations require data localization and content moderation",
        "The Pakistan Telecommunication Authority (PTA) has issued new guidelines for "
        "social media companies operating in Pakistan. The regulations include requirements "
        "for local data storage and enhanced content moderation...",
        "Policy",
        author3.id,
        {"PTA", "Regulation", "Social Media", "Policy"},
        "https://example.com/pta.jpg"
    );
    db.publishArticle(article4.id);
    std::cout << "  ✓ Published: " << article4.title << std::endl;

    auto article5 = db.createArticle(
        "WhatsApp Introduces AI-Powered Features in Pakistan",
        "Meta rolls out new AI chatbot and image generation features",
        "WhatsApp users in Pakistan can now access Meta's new AI-powered features including "
        "an intelligent chatbot and image generation capabilities. The rollout marks Pakistan's "
        "inclusion in Meta's AI expansion strategy...",
        "Apps",
        author1.id,
        {"WhatsApp", "AI", "Meta", "Apps"},
        "https://example.com/whatsapp.jpg"
    );
    db.publishArticle(article5.id);
    db.incrementViewCount(article5.id);
    std::cout << "  ✓ Published: " << article5.title << std::endl;

    // Draft article (not published)
    auto draftArticle = db.createArticle(
        "Upcoming: iPhone 16 Launch Date in Pakistan",
        "Apple's latest flagship expected to arrive next month",
        "Draft content here...",
        "Mobile",
        author1.id,
        {"Apple", "iPhone", "Launch"}
    );
    std::cout << "  📝 Draft: " << draftArticle.title << std::endl;

    // 4. Browse published articles
    printSeparator("PUBLISHED ARTICLES");
    for (const auto& article : db.getPublishedArticles(10)) {
        printArticle(article);
    }

    // 5. Search functionality
    printSeparator("SEARCH: '5G'");
    auto searchResult = searchService.search("5G");
    std::cout << "  Found " << searchResult.totalResults << " result(s) in "
              << std::fixed << std::setprecision(2) << searchResult.searchTime 
              << "ms" << std::endl;
    for (const auto& article : searchResult.articles) {
        std::cout << "  - " << article.title << std::endl;
    }

    // 6. Category filtering
    printSeparator("ARTICLES BY CATEGORY: 'Telecom'");
    for (const auto& article : db.getArticlesByCategory("Telecom")) {
        std::cout << "  - " << article.title << std::endl;
    }

    // 7. Trending articles
    printSeparator("TRENDING ARTICLES");
    for (const auto& article : db.getTrendingArticles(3)) {
        std::cout << "  🔥 " << article.title << " (" << article.viewCount << " views)" << std::endl;
    }

    // 8. User interactions
    printSeparator("USER INTERACTIONS");
    auto reader = db.createUser("reader@gmail.com", "Muhammad Ali", UserRole::READER);
    std::cout << "  ✓ User registered: " << reader.name << std::endl;
    
    db.bookmarkArticle(reader.id, article1.id);
    db.bookmarkArticle(reader.id, article3.id);
    std::cout << "  ✓ Bookmarked 2 articles" << std::endl;
    
    auto bookmarks = db.getUserBookmarks(reader.id);
    std::cout << "  User bookmarks:" << std::endl;
    for (const auto& article : bookmarks) {
        std::cout << "    - " << article.title << std::endl;
    }

    // 9. Comments
    printSeparator("COMMENTS");
    auto comment1 = db.addComment(article1.id, reader.id, reader.name,
        "Great news! Finally 5G is coming to Pakistan!");
    std::cout << "  💬 " << comment1.userName << ": " << comment1.content << std::endl;
    
    db.likeComment(comment1.id);
    std::cout << "     👍 Likes: 1" << std::endl;

    // 10. Newsletter
    printSeparator("NEWSLETTER");
    db.subscribeNewsletter("subscriber1@gmail.com");
    db.subscribeNewsletter("subscriber2@gmail.com");
    db.subscribeNewsletter("subscriber3@gmail.com");
    std::cout << "  ✓ 3 new subscribers added" << std::endl;
    std::cout << "  Active subscribers: " << db.getActiveSubscribers().size() << std::endl;

    // 11. Related articles
    printSeparator("RELATED ARTICLES (for Telecom article)");
    // For demo, show by same category
    for (const auto& article : db.getRelatedArticles(article1.id, 3)) {
        std::cout << "  - " << article.title << std::endl;
    }

    // 12. Home feed
    printSeparator("HOME FEED STRUCTURE");
    auto feed = feedService.getHomeFeed();
    std::cout << "  Featured articles: " << feed.featured.size() << std::endl;
    std::cout << "  Latest articles: " << feed.latest.size() << std::endl;
    std::cout << "  Trending articles: " << feed.trending.size() << std::endl;
    std::cout << "  Categories with articles: " << feed.byCategory.size() << std::endl;

    // 13. Statistics
    printSeparator("PLATFORM STATISTICS");
    auto stats = db.getStatistics();
    std::cout << "  📊 Total Articles: " << stats.totalArticles << std::endl;
    std::cout << "     - Published: " << stats.publishedArticles << std::endl;
    std::cout << "     - Drafts: " << stats.draftArticles << std::endl;
    std::cout << "  ✍️  Total Authors: " << stats.totalAuthors << std::endl;
    std::cout << "  📁 Total Categories: " << stats.totalCategories << std::endl;
    std::cout << "  👥 Total Users: " << stats.totalUsers << std::endl;
    std::cout << "  💬 Total Comments: " << stats.totalComments << std::endl;
    std::cout << "  📧 Newsletter Subscribers: " << stats.totalSubscribers << std::endl;
    std::cout << "  👁️  Total Views: " << stats.totalViews << std::endl;

    printSeparator("DEMO COMPLETE");
    std::cout << "\nThis C++ implementation mirrors the ProPakistani news clone logic:" << std::endl;
    std::cout << "  • Article management (create, publish, archive)" << std::endl;
    std::cout << "  • Category-based organization" << std::endl;
    std::cout << "  • Author profiles and attribution" << std::endl;
    std::cout << "  • Full-text search functionality" << std::endl;
    std::cout << "  • User bookmarks and comments" << std::endl;
    std::cout << "  • Trending and related articles" << std::endl;
    std::cout << "  • Newsletter subscription system" << std::endl;
    std::cout << "  • Admin dashboard statistics" << std::endl;
    std::cout << "  • Home feed aggregation" << std::endl;
}

int main() {
    runDemo();
    return 0;
}
