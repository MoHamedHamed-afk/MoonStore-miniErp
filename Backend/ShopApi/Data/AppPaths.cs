namespace ShopApi.Data;

public static class AppPaths
{
    public static string ResolveAppDataRoot(string contentRootPath, IConfiguration configuration)
    {
        var configuredRoot = configuration["APP_DATA_ROOT"];
        if (!string.IsNullOrWhiteSpace(configuredRoot))
        {
            Directory.CreateDirectory(configuredRoot);
            return configuredRoot;
        }

        return ResolveProjectRoot(contentRootPath);
    }

    public static string ResolveSqlitePath(string contentRootPath, IConfiguration configuration)
    {
        var configuredSqlitePath = configuration["SQLITE_PATH"];
        if (!string.IsNullOrWhiteSpace(configuredSqlitePath))
        {
            var directory = Path.GetDirectoryName(configuredSqlitePath);
            if (!string.IsNullOrWhiteSpace(directory))
            {
                Directory.CreateDirectory(directory);
            }

            return configuredSqlitePath;
        }

        return Path.Combine(ResolveAppDataRoot(contentRootPath, configuration), "shop.db");
    }

    public static string ResolveUploadsPath(IWebHostEnvironment environment, IConfiguration configuration)
    {
        var configuredUploadsPath = configuration["UPLOADS_PATH"];
        if (!string.IsNullOrWhiteSpace(configuredUploadsPath))
        {
            Directory.CreateDirectory(configuredUploadsPath);
            return configuredUploadsPath;
        }

        var dataRoot = configuration["APP_DATA_ROOT"];
        if (!string.IsNullOrWhiteSpace(dataRoot))
        {
            var uploadsPath = Path.Combine(dataRoot, "uploads");
            Directory.CreateDirectory(uploadsPath);
            return uploadsPath;
        }

        var webRootPath = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var defaultUploadsPath = Path.Combine(webRootPath, "uploads");
        Directory.CreateDirectory(defaultUploadsPath);
        return defaultUploadsPath;
    }

    private static string ResolveProjectRoot(string contentRootPath)
    {
        var currentDirectory = new DirectoryInfo(contentRootPath);

        while (currentDirectory is not null)
        {
            var projectFile = Path.Combine(currentDirectory.FullName, "ShopApi.csproj");
            if (File.Exists(projectFile))
            {
                return currentDirectory.FullName;
            }

            currentDirectory = currentDirectory.Parent;
        }

        return contentRootPath;
    }
}
