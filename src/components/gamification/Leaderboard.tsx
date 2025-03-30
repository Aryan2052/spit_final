import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Star } from 'lucide-react';
import * as THREE from 'three';

interface LeaderboardProps {
  leaderboard: {
    _id: string;
    userId: {
      _id: string;
      username: string;
      email: string;
    };
    points: number;
    level: number;
  }[];
  currentUserId?: string;
}

const LeaderboardComponent: React.FC<LeaderboardProps> = ({ leaderboard, currentUserId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize Three.js scene for 3D leaderboard visualization
  useEffect(() => {
    if (!canvasRef.current || leaderboard.length === 0) return;
    
    // Set up scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      canvasRef.current.clientWidth / canvasRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    
    // Create podium
    const podiumGeometry = new THREE.BoxGeometry(1, 1, 1);
    const podiumMaterial1 = new THREE.MeshBasicMaterial({ color: 0xffd700 }); // Gold
    const podiumMaterial2 = new THREE.MeshBasicMaterial({ color: 0xc0c0c0 }); // Silver
    const podiumMaterial3 = new THREE.MeshBasicMaterial({ color: 0xcd7f32 }); // Bronze
    
    // First place (center, tallest)
    const podium1 = new THREE.Mesh(podiumGeometry, podiumMaterial1);
    podium1.position.set(0, -1, 0);
    podium1.scale.set(1, 2, 1);
    scene.add(podium1);
    
    // Second place (left, medium)
    const podium2 = new THREE.Mesh(podiumGeometry, podiumMaterial2);
    podium2.position.set(-1.2, -1.5, 0);
    podium2.scale.set(1, 1, 1);
    scene.add(podium2);
    
    // Third place (right, shortest)
    const podium3 = new THREE.Mesh(podiumGeometry, podiumMaterial3);
    podium3.position.set(1.2, -1.8, 0);
    podium3.scale.set(1, 0.4, 1);
    scene.add(podium3);
    
    // Add text for top 3 names
    const addText = (text: string, position: THREE.Vector3, color: number) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;
      
      canvas.width = 256;
      canvas.height = 64;
      
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.font = '24px Arial';
      context.fillStyle = `#${color.toString(16)}`;
      context.textAlign = 'center';
      context.fillText(text, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
      });
      
      const geometry = new THREE.PlaneGeometry(1, 0.25);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      scene.add(mesh);
    };
    
    // Add names for top 3
    if (leaderboard.length > 0) {
      addText(leaderboard[0].userId.username, new THREE.Vector3(0, 0.2, 0.51), 0xffd700);
    }
    
    if (leaderboard.length > 1) {
      addText(leaderboard[1].userId.username, new THREE.Vector3(-1.2, -0.9, 0.51), 0xc0c0c0);
    }
    
    if (leaderboard.length > 2) {
      addText(leaderboard[2].userId.username, new THREE.Vector3(1.2, -1.5, 0.51), 0xcd7f32);
    }
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate the podiums slightly
      podium1.rotation.y += 0.01;
      podium2.rotation.y += 0.01;
      podium3.rotation.y += 0.01;
      
      renderer.render(scene, camera);
    };
    
    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [leaderboard]);
  
  return (
    <div>
      {/* 3D Leaderboard Visualization */}
      <div className="mb-8 h-64 rounded-lg overflow-hidden border">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      
      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            Leaderboard
          </CardTitle>
          <CardDescription>
            Top participants ranked by points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No participants yet. Be the first to earn points!
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div 
                  key={entry._id}
                  className={`flex items-center justify-between p-3 rounded-md ${
                    entry.userId._id === currentUserId 
                      ? 'bg-primary/10 border border-primary/20' 
                      : index % 2 === 0 ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 text-center font-bold">
                      {index === 0 ? (
                        <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />
                      ) : index === 1 ? (
                        <Medal className="h-5 w-5 text-gray-400 mx-auto" />
                      ) : index === 2 ? (
                        <Award className="h-5 w-5 text-amber-700 mx-auto" />
                      ) : (
                        `#${index + 1}`
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {entry.userId.username}
                        {entry.userId._id === currentUserId && (
                          <span className="ml-2 text-xs text-primary">(You)</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Level {entry.level}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold">
                    {entry.points} <span className="text-xs text-muted-foreground">pts</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardComponent;
