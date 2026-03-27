import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Attempting an Atlas Vector Search (requires index name "default" or you can specify)
    // For standard text search without Vector, we use $search.
    try {
      const results = await Project.aggregate([
        {
          $search: {
            index: "default", // Name of the Atlas Search index
            text: {
              query: query,
              path: ["title", "description", "tags"],
              fuzzy: {
                maxEdits: 1,
                prefixLength: 2
              }
            }
          }
        },
        { $match: { isDeleted: { $ne: true } } },
        { $limit: 8 },
        { 
          $project: { 
            title: 1, 
            software_type: 1, 
            author_id: 1, 
            downloads: 1 
          } 
        }
      ]);
      
      return NextResponse.json({ success: true, data: results });
    } catch (err) {
      console.warn("Atlas Search failed (likely index not configured). Falling back to basic regex search.", err);
      // Fallback to basic term search for demo purposes
      const results = await Project.find({
        isDeleted: { $ne: true },
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).limit(8).select('title software_type author_id downloads').lean();
      
      return NextResponse.json({ success: true, data: results });
    }
    
  } catch (error: any) {
    console.error("Advanced search error:", error);
    return NextResponse.json({ success: false, error: 'Failed to search projects' }, { status: 500 });
  }
}
