#!/usr/bin/env python3
"""
AWS CDK Architecture Diagram Generator for Space Shooter Game
Analyzes the current CDK implementation and generates visual architecture diagrams

Current CDK Implementation Analysis:
✅ S3 Bucket - Static website hosting, versioning, encryption, lifecycle rules
✅ IAM Policies - Bucket policy with CloudFront service principal access
✅ CDK Stack - TypeScript implementation with SpaceShooterStack class
✅ Security - Block public access, prepared for Origin Access Control
✅ Infrastructure - Methods ready for CloudFront integration
⏳ CloudFront - Prepared but not yet deployed (Task 3)
⏳ Automation - File sync and cache invalidation (Task 4)

Usage:
    python generate_aws_architecture_diagram.py
"""

import os
import sys

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

def generate_aws_architecture_diagram():
    """Generate the AWS CDK architecture diagram"""
    if not DIAGRAMS_AVAILABLE:
        print("Cannot generate visual diagram - diagrams package not available")
        print("Install with: pip install diagrams")
        return False
    
    try:
        # Create generated-diagrams directory if it doesn't exist
        os.makedirs("generated-diagrams", exist_ok=True)
        
        # Change to generated-diagrams directory for output
        original_dir = os.getcwd()
        os.chdir("generated-diagrams")
        
        with Diagram(
            "Space Shooter Game - AWS CDK Architecture",
            filename="space_shooter_aws_cdk_architecture",
            show=False,
            direction="TB",
            graph_attr={
                "fontsize": "14",
                "bgcolor": "white",
                "pad": "0.5"
            }
        ):
            
            # External users
            users = Users("Global Users")
            
            # Developer environment
            with Cluster("Development Environment"):
                developer = User("Developer")
                
                with Cluster("Local Project"):
                    game_files = GenericDatabase("Game Files\\n• index.html\\n• game.js (enhanced)\\n• style.css")
                    
                with Cluster("CDK Project"):
                    cdk_app = TypeScript("CDK App\\n• app.ts")
                    cdk_stack = SDK("CDK Stack\\n• space-shooter-stack.ts")
            
            # AWS Cloud Infrastructure
            with Cluster("AWS Cloud Infrastructure"):
                
                # Infrastructure as Code
                with Cluster("Infrastructure as Code"):
                    cloudformation = Cloudformation("CloudFormation\\nSpaceShooterStack")
                    cdk_logs = CloudwatchLogs("CDK Logs")
                
                # Security and Access Control
                with Cluster("Security & Access"):
                    bucket_policy = IAM("S3 Bucket Policy\\n• Block Public Access\\n• CloudFront OAC Ready")
                    oac_identity = IAM("Origin Access Control\\n(Prepared)")
                
                # Current Implementation - S3
                with Cluster("Static Website Storage (DEPLOYED)"):
                    s3_bucket = S3("S3 Bucket\\n• Static Website Hosting\\n• Versioned & Encrypted\\n• Private Access Only\\n• Lifecycle Rules")
                
                # Future CloudFront Implementation
                with Cluster("Content Delivery (TASK 3)", graph_attr={"style": "dashed"}):
                    cloudfront = CloudFront("CloudFront Distribution\\n(Prepared Methods)\\n• Global CDN\\n• HTTPS Enforcement")
            
            # Development and deployment flow
            developer >> Edge(label="1. CDK Deploy", style="bold") >> cdk_app
            cdk_app >> Edge(label="Synthesizes") >> cdk_stack
            cdk_stack >> Edge(label="Creates") >> cloudformation
            
            # Infrastructure creation
            cloudformation >> Edge(label="2. Creates Resources") >> [s3_bucket, bucket_policy]
            cloudformation >> Edge(label="Logs", style="dotted") >> cdk_logs
            
            # File upload process
            game_files >> Edge(label="3. Upload Assets") >> s3_bucket
            
            # Security configuration
            bucket_policy >> Edge(label="Secures Bucket") >> s3_bucket
            oac_identity >> Edge(label="Prepared for CloudFront", style="dashed") >> s3_bucket
            
            # Current access path
            s3_bucket >> Edge(label="Website Endpoint\\n(Current)", style="bold") >> users
            
            # Future CloudFront integration
            s3_bucket >> Edge(label="Origin (Future)", style="dotted") >> cloudfront
            cloudfront >> Edge(label="Global CDN (Future)", style="dotted") >> users
            oac_identity >> Edge(label="Secure Access (Future)", style="dotted") >> cloudfront
        
        # Return to original directory
        os.chdir(original_dir)
        
        print("✅ AWS CDK architecture diagram generated successfully!")
        print("📁 File created: generated-diagrams/space_shooter_aws_cdk_architecture.png")
        return True
        
    except Exception as e:
        # Return to original directory in case of error
        if 'original_dir' in locals():
            os.chdir(original_dir)
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

🎮 GAME ENHANCEMENT INTEGRATION:
• Enhanced game.js with state management system
• Power-up system implementation in progress
• Theme system with character selection
• Enemy health system with visual feedback
• Compatible with current S3 static hosting setup
""")

def main():
    """Main function to generate diagram and print summary"""
    print("🎮 Space Shooter Game - AWS CDK Architecture Generator")
    print("=" * 60)
    
    # Print architecture summary
    print_architecture_summary()
    
    # Generate visual diagram if possible
    print("\n📊 Generating Visual Architecture Diagram...")
    if generate_aws_architecture_diagram():
        print("\n✨ Architecture diagram generation complete!")
        print("📁 Check the generated-diagrams folder for the PNG file")
        print("🔍 Key Features:")
        print("   • Current S3 static website hosting implementation")
        print("   • Prepared methods for CloudFront integration")
        print("   • Comprehensive security configuration")
        print("   • Infrastructure as Code with TypeScript CDK")
        print("   • Integration with enhanced game features")
    else:
        print("\n📝 Visual diagram generation not available")
        print("💡 Install 'diagrams' package and Graphviz for visual diagrams")
        print("   pip install diagrams")
        print("   https://graphviz.org/download/")

if __name__ == "__main__":
    main()