#!/bin/bash

# EchoMind Setup Script
# This script helps you set up the EchoMind project

set -e

echo "🚀 Welcome to EchoMind Setup!"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if required ports are available
check_ports() {
    print_status "Checking if required ports are available..."
    
    local ports=(3000 8000 5432 6379)
    local unavailable_ports=()
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            unavailable_ports+=($port)
        fi
    done
    
    if [ ${#unavailable_ports[@]} -ne 0 ]; then
        print_warning "The following ports are already in use: ${unavailable_ports[*]}"
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "All required ports are available"
    fi
}

# Setup environment variables
setup_env() {
    print_status "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cp backend/env.example .env
        print_success "Created .env file from template"
    else
        print_warning ".env file already exists"
    fi
    
    # Prompt for API keys
    echo
    print_status "Please enter your API keys (press Enter to skip):"
    
    read -p "OpenAI API Key: " openai_key
    if [ ! -z "$openai_key" ]; then
        sed -i.bak "s/your-openai-api-key-here/$openai_key/" .env
    fi
    
    read -p "Anthropic API Key: " anthropic_key
    if [ ! -z "$anthropic_key" ]; then
        sed -i.bak "s/your-anthropic-api-key-here/$anthropic_key/" .env
    fi
    
    print_success "Environment variables configured"
}

# Build and start services
start_services() {
    print_status "Building and starting EchoMind services..."
    
    # Export environment variables for docker-compose
    export $(cat .env | grep -v '^#' | xargs)
    
    # Build and start services
    docker-compose up -d --build
    
    print_success "Services started successfully!"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for backend
    print_status "Waiting for backend service..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:8000/health >/dev/null 2>&1; then
            print_success "Backend service is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Backend service failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for frontend
    print_status "Waiting for frontend service..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3000 >/dev/null 2>&1; then
            print_success "Frontend service is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Frontend service failed to start within 60 seconds"
        exit 1
    fi
}

# Show final information
show_final_info() {
    echo
    echo "🎉 EchoMind Setup Complete!"
    echo "================================"
    echo
    print_success "Your EchoMind application is now running!"
    echo
    echo "📱 Access your application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   API Documentation: http://localhost:8000/docs"
    echo
    echo "📊 Monitoring (Optional):"
    echo "   Grafana: http://localhost:3001 (admin/admin)"
    echo "   Prometheus: http://localhost:9090"
    echo
    echo "🔧 Useful commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart services: docker-compose restart"
    echo "   Update services: docker-compose pull && docker-compose up -d"
    echo
    print_warning "Don't forget to configure your API keys in the .env file!"
    echo
}

# Main setup function
main() {
    check_docker
    check_ports
    setup_env
    start_services
    wait_for_services
    show_final_info
}

# Run main function
main "$@" 