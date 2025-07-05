# Use a lightweight web server to serve the local build
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy the local build directory into the image
COPY build/ .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]