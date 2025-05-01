import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const MemoryMapsPage = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-md">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-3xl font-bold text-indigo-700 mb-2">Memory Maps</CardTitle>
          <CardDescription className="text-center text-lg text-gray-600">
            Visualize, organize, and enhance your memory with interactive memory maps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              + Create Memory Map
            </Button>
          </div>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Maps</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div className="text-center text-gray-500 py-8">
                <span className="text-2xl">🗺️</span>
                <p className="mt-2">No memory maps yet. Start by creating your first one!</p>
              </div>
            </TabsContent>
            <TabsContent value="favorites">
              <div className="text-center text-gray-400 py-8">
                <span className="text-2xl">⭐</span>
                <p className="mt-2">No favorites yet.</p>
              </div>
            </TabsContent>
            <TabsContent value="archived">
              <div className="text-center text-gray-400 py-8">
                <span className="text-2xl">🗄️</span>
                <p className="mt-2">No archived memory maps.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
};

export default MemoryMapsPage; 