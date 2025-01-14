# FROM node:18-alpine




# # ARG SHOPIFY_API_KEY
# # ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY

# # Accept build arguments for environment variables
# ARG SHOPIFY_API_KEY
# ARG HOST
# ARG SHOP
# ARG SCOPES
# ARG PORT

# # Set environment variables
# ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
# ENV HOST=$HOST
# ENV SHOP=$SHOP
# ENV SCOPES=$SCOPES
# ENV PORT=$PORT
# ENV NODE_ENV=production


# EXPOSE 8081
# WORKDIR /app
# COPY web .
# RUN npm install
# RUN cd frontend && npm install && npm run build
# CMD ["npm", "run", "serve"]


FROM node:18-alpine

# Set build arguments and environment variables
ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY

# Set working directory
WORKDIR /app

# Copy web directory contents
COPY web .

# Install dependencies and build frontend
RUN npm install
RUN cd frontend && npm install && npm run build

EXPOSE 8081

CMD ["npm", "run", "serve"]