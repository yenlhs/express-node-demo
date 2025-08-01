# Express Node Demo

A simple Node.js Express API that runs in a Docker container.

## API Endpoints

- `GET /` - Returns "hello World"

## Running with Docker

### Option 1: Using Task (Recommended)

1. Start the app with Docker Compose:

   ```bash
   task start
   ```

2. View logs (since containers run in background):

   ```bash
   task logs
   ```

3. Stop the app:

   ```bash
   task stop
   ```

4. View all available tasks:
   ```bash
   task --list
   ```

The `task start` command will automatically build and run the Docker container with hot reload enabled in detached mode (background).

### Option 2: Using Docker commands

1. Build the Docker image:

   ```bash
   docker build -t express-node-demo .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 express-node-demo
   ```

### Option 3: Using Docker Compose directly

1. Build and run with docker-compose:

   ```bash
   docker-compose up --build -d
   ```

   This will start the container with hot reload enabled in detached mode (background). Any changes you make to the source code will automatically restart the server inside the container.

2. To view logs:
   ```bash
   docker-compose logs -f
   ```

## Hot Reload Features

The Docker Compose setup includes:

- **Volume mounting**: Your local source code is mounted into the container
- **Nodemon**: Automatically restarts the server when files change
- **Development environment**: NODE_ENV is set to development

When you make changes to any `.js` files, nodemon will detect the changes and restart the Express server automatically.

## Testing the API

Once the container is running, you can test the API:

```bash
curl http://localhost:3000/
```

Expected response:

```json
{
	"message": "hello World"
}
```

## Development (without Docker)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Available Task Commands

[Task](https://taskfile.dev/) provides the following commands for managing your Docker containers:

- `task start` - Start the Express app with Docker Compose in detached mode (background)
- `task stop` - Stop the Docker containers
- `task restart` - Restart the Docker containers (stop + start)
- `task logs` - Show logs from the running containers (use this to see output)
- `task build` - Build the Docker image without starting
- `task clean` - Remove containers, networks, and images (full cleanup)
- `task --list` - Show all available tasks

## AWS Deployment

Deploy your Express app to AWS ECS using Terraform:

### Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform installed
3. Docker installed
4. Task installed

### Deployment Steps

1. **Initial deployment** (creates all AWS infrastructure):

   ```bash
   task deploy
   ```

2. **Update deployment** (pushes new Docker image and updates ECS service):

   ```bash
   task deploy-update
   ```

3. **View deployment plan** (before applying):

   ```bash
   task tf-plan
   ```

4. **Destroy infrastructure** (when done):
   ```bash
   task tf-destroy
   ```

### What Gets Created

The Terraform configuration creates:

- **ECR Repository** - For storing Docker images
- **VPC** - With public/private subnets across 2 AZs
- **Application Load Balancer** - For distributing traffic
- **ECS Cluster** - Fargate-based container cluster
- **ECS Service** - Running your Express app
- **Security Groups** - For network security
- **CloudWatch Logs** - For application logging
- **IAM Roles** - For ECS task execution

### Infrastructure Details

- **Region**: ap-southeast-2 (Sydney)
- **Compute**: AWS Fargate (256 CPU, 512 MB RAM)
- **Networking**: Private subnets with NAT Gateway
- **Load Balancer**: Application Load Balancer on port 80
- **Logging**: CloudWatch with 7-day retention

### Available Deployment Tasks

- `task deploy` - Complete initial deployment
- `task deploy-update` - Update with new Docker image
- `task tf-init` - Initialize Terraform
- `task tf-plan` - Show Terraform plan

## GitHub Actions Deployment

The project includes two automated deployment workflows via GitHub Actions:

### 1. Docker Application Deployment (`deploy.yml`)

**Triggers**: Changes to application code (excluding Terraform files)

**What it does**:

- Builds and pushes Docker images to ECR
- Updates ECS service with new image
- Tests the deployment

**Prerequisites**:

- AWS credentials configured in GitHub secrets

### 2. Terraform Infrastructure Deployment (`terraform-deploy.yml`)

**Triggers**: Changes to Terraform files only

**What it does**:

- Validates and formats Terraform code
- Plans infrastructure changes
- Applies changes on push to main
- Comments PRs with plan details

**Prerequisites**:

- AWS credentials configured in GitHub secrets
- Full AWS permissions for infrastructure management

### Required AWS Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key

### AWS IAM Permissions

**For Docker Deployment**:

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"ecr:GetAuthorizationToken",
				"ecr:BatchCheckLayerAvailability",
				"ecr:GetDownloadUrlForLayer",
				"ecr:BatchGetImage",
				"ecr:PutImage",
				"ecr:InitiateLayerUpload",
				"ecr:UploadLayerPart",
				"ecr:CompleteLayerUpload",
				"ecs:UpdateService",
				"ecs:DescribeServices",
				"ecs:DescribeTasks",
				"elbv2:DescribeLoadBalancers",
				"elbv2:DescribeTargetGroups"
			],
			"Resource": "*"
		}
	]
}
```

**For Terraform Deployment** (additional permissions):

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"ec2:*",
				"ecs:*",
				"ecr:*",
				"elasticloadbalancing:*",
				"iam:*",
				"logs:*",
				"acm:*"
			],
			"Resource": "*"
		}
	]
}
```

### Workflow Behavior

- **Application Changes**: Triggers Docker deployment workflow
- **Infrastructure Changes**: Triggers Terraform deployment workflow
- **PRs**: Show plans without applying changes
- **Main Branch**: Apply changes automatically
