using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public static class DatabaseSeeder
{
    public static void Seed(AppDbContext context)
    {
        if (context.Products.Any())
            return;

        context.Products.AddRange(
            new Product { Name = "Laptop", Description = "High-performance laptop", Price = 999.99m, Category = "Electronics", Image = "https://placehold.co/400x300/3b82f6/white?text=Laptop", Rating = new ProductRating { Rate = 4.5, Count = 120 } },
            new Product { Name = "Mouse", Description = "Wireless ergonomic mouse", Price = 29.99m, Category = "Electronics", Image = "https://placehold.co/400x300/ef4444/white?text=Mouse", Rating = new ProductRating { Rate = 4.2, Count = 85 } },
            new Product { Name = "Keyboard", Description = "Mechanical keyboard", Price = 79.99m, Category = "Electronics", Image = "https://placehold.co/400x300/22c55e/white?text=Keyboard", Rating = new ProductRating { Rate = 4.7, Count = 200 } }
        );
        context.AdminUsers.AddRange(
            new AdminUser { FirstName = "Michael", LastName = "Garcia", Email = "michael@example.com", PhoneNumber = "+1-555-0101", IsActive = true },
            new AdminUser { FirstName = "Sarah", LastName = "Johnson", Email = "sarah@example.com", PhoneNumber = "+1-555-0102", IsActive = true },
            new AdminUser { FirstName = "James", LastName = "Wilson", Email = "james@example.com", PhoneNumber = "+1-555-0103", IsActive = false }
        );
        context.SaveChanges();
    }
}
