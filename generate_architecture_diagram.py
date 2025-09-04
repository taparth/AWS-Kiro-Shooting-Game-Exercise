#!/usr/bin/env python3
"""
AWS CDK Architecture Diagram Generator for Space Shooter Game
Analyzes the current CDK implementation and generates visual architecture diagrams

Usage:
    python generate_architecture_diagram.py

Requirements:
    pip install diagrams
"""

try:
    from diagrams import Diagram, Cluster, Edge
    from diagrams.aws.storage import S3
    from diagrams.aws.network import CloudFront
    from diagrams.aws.security import IAM
    from diagrams.aws.management import Cloudformation, CloudwatchLogs
    from diagrams.aws.general import Users, User, SDK, GenericDatabase
    from diagrams.programming.language import TypeScript
    DIAGRAMS_AVAILABLE = True
except ImportError:
    DIAGRAMS_AVAILABLE = False
    print("ERROR: 'diagrams' package not found!")
    print("Please install it using: pip install diagrams")

def generate_cdk_architecture_diagram():
    """Generate the AWS CDK architecture diagram"""
    if not DIAGRAMS_AVAILABLE:
        print("Cannot generate visual diagram - diagrams package not available")
        return False
    
    try:
        with Diagram(
            "Space Shooter Game - AWS CDK Architecture",
            filename="space_shooter_cdk_architecture",
            show=False,
            direction="TB",
            graph_attr={
                "fontsize": "14",
                "bgcolor": "white",
                "pad": "0.5"
            }
        ):
            
            # External users
            users = Users("End Users")
            
            # Developer environment
            with Cluster("Development Environment"):
                developer = User("Developer")
                
                with Cluster("Local Project"):
                    game_files = GenericDatabase("Game Files\\n• index.html\\n• game.js\\n• style.css")
                    
                with Cluster("CDK Project"):
                    cdk_app = TypeScript("CDK App\\n• app.ts\\n• SpaceShooterStack")
                    cdk_stack = SDK("CDK Stack\\n• space-shooter-stack.ts")
            
            # AWS Cloud Infrastructure
            with Cluster("AWS Cloud Infrastructure"):
                
                # Infrastructure as Code
                with Cluster("Infrastructure as Code"):
                    cloudformation = Cloudformation("CloudFormation\\nSpaceShooterStack")
                    cdk_logs = CloudwatchLogs("CDK Logs")
                
                # Security and Access Control
                with Cluster("Security & Access"):
                    bucket_policy = IAM("S3 Bucket Policy\\n• Block Public Access\\n• CloudFront Ready")
                
                # Current Implementation - S3
                with Cluster("Static Website Storage"):
                    s3_bucket = S3("S3 Bucket\\n• Static Website Hosting\\n• Versioned & Encrypted\\n• Lifecycle Rules")
                
                # Future CloudFront Implementation
                with Cluster("Content Delivery (Planned)", graph_attr={"style": "dashed"}):
                    cloudfront = CloudFront("CloudFront Distribution\\n• Global CDN\\n• HTTPS Enforcement")
            
            # Development and deployment flow
            developer >> Edge(label="CDK Deploy", style="bold") >> cdk_app
            cdk_app >> Edge(label="Synthesizes") >> cdk_stack
            cdk_stack >> Edge(label="Creates") >> cloudformation
            
            # Infrastructure creation
            cloudformation >> Edge(label="Creates Resources") >> [s3_bucket, bucket_policy]
            cloudformation >> Edge(label="Logs", style="dotted") >> cdk_logs
            
            # File upload process
            game_files >> Edge(label="Upload Assets") >> s3_bucket
            
            # Security configuration
            bucket_policy >> Edge(label="Secures") >> s3_bucket
            
            # Current access path
            s3_bucket >> Edge(label="Website Endpoint\\n(Current)", style="bold") >> users
            
            # Future CloudFront integration
            s3_bucket >> Edge(label="Origin (Future)", style="dotted") >> cloudfront
            cloudfront >> Edge(label="Global CDN (Future)", style="dotted") >> users
        
        print("✅ AWS CDK architecture diagram generated successfully!")
        print("📁 File created: space_shooter_cdk_architecture.png")
        return True
        
    except Exception as e:
        print(f"⚠️  Diagram generation failed: {e}")
        return False

def print_architecture_summary():
    """Print a summary of the current architecture"""
    print("""
SPACE SHOOTER GAME - AWS CDK ARCHITECTURE SUMMARY
=================================================

📋 CURRENT IMPLEMENTATION:
✅ S3 Bucket - Static website hosting with security
✅ IAM Policies - Bucket policy prepared for CloudFront
✅ CDK Stack - Infrastructure as Code with TypeScript
✅ Stack Outputs - Bucket name and website URL
✅ Security - Block public access, encryption, versioning
✅ Cost Optimization - Lifecycle rules for old versions

⏳ PLANNED (Task 3):
• CloudFront distribution with Origin Access Control
• Cache behaviors for optimal performance
• Security headers and HTTPS enforcement
• Global content delivery network

🔧 KEY CDK FEATURES:
• SpaceShooterStack class with comprehensive S3 config
• grantCloudFrontAccess() method prepared for Task 3
• getBucketDomainName() method for CloudFront origin
• Modern CDK v2.87.0 with TypeScript implementation

📊 CURRENT DATA FLOW:
Developer → CDK Deploy → CloudFormation → S3 Bucket → Users

📊 FUTURE DATA FLOW (Task 3):
Developer → CDK Deploy → [S3 + CloudFront] → Global CDN → Users
""")

def main():
    """Main function to generate diagram and print summary"""
    print("🎮 Space Shooter Game - AWS CDK Architecture Generator")
    print("=" * 60)
    
    # Print architecture summary
    print_architecture_summary()
    
    # Generate visual diagram if possible
    print("\n📊 Generating Visual Architecture Diagram...")
    if generate_cdk_architecture_diagram():
        print("\n✨ Architecture diagram generation complete!")
        print("📁 Check the generated PNG file for visual representation")
    else:
        print("\n📝 Visual diagram generation not available")
        print("💡 Install 'diagrams' package and Graphviz for visual diagrams")
        print("   pip install diagrams")
        print("   https://graphviz.org/download/")

if __name__ == "__main__":
    main()