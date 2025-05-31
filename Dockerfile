FROM node:20

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
# This layer only rebuilds if your dependencies change
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
# This layer rebuilds if your application code changes
COPY . .

# Expose the port your app runs on
EXPOSE 4000 

# Command to run your application
CMD ["node", "src/index.js"] 