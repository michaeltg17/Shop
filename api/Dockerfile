# Stage 1: Build and publish
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy project file for layer caching
COPY src/Api/Api.csproj ./
RUN dotnet restore

# Copy source and publish
COPY src/Api/ .
RUN dotnet publish -c Release -o /out

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /out .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Api.dll"]
