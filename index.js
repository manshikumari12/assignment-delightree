db.users.aggregate([
    
    {
      $addFields: {
        ageRange: {
          $switch: {
            branches: [
              { case: { $and: [{ $gte: ["$age", 18] }, { $lte: ["$age", 24] }] }, then: "18-24" },
              { case: { $and: [{ $gte: ["$age", 25] }, { $lte: ["$age", 34] }] }, then: "25-34" },
              { case: { $and: [{ $gte: ["$age", 35] }, { $lte: ["$age", 44] }] }, then: "35-44" },
              { case: { $gte: ["$age", 45] }, then: "45+" }
            ],
            default: "Unknown"
          }
        }
      }
    },
  
    // Join posts/comments/likes/views related to each user using lookup
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "authorId",
        as: "posts"
      }
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "userId",
        as: "comments"
      }
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "userId",
        as: "likes"
      }
    },
    {
      $lookup: {
        from: "views",
        localField: "_id",
        foreignField: "userId",
        as: "views"
      }
    },
  
    // Project the required counts
    {
      $project: {
        ageRange: 1,
        postCount: { $size: "$posts" },
        commentCount: { $size: "$comments" },
        likeCount: { $size: "$likes" },
        viewCount: { $size: "$views" }
      }
    },
  
    // Group by age range and calculate total counts
    {
      $group: {
        _id: "$ageRange",
        totalPosts: { $sum: "$postCount" },
        totalComments: { $sum: "$commentCount" },
        totalLikes: { $sum: "$likeCount" },
        totalViews: { $sum: "$viewCount" }
      }
    }
  ]);
  
  // Expected example output
  [
    {
      "_id": "18-24",
      "totalPosts": 12,
      "totalComments": 21,
      "totalLikes": 21,
      "totalViews": 12
    },
    {
      "_id": "25-34",
      "totalPosts": 21,
      "totalComments": 12,
      "totalLikes": 21,
      "totalViews": 12
    },
    {
      "_id": "35-44",
      "totalPosts": 12,
      "totalComments": 12,
      "totalLikes": 12,
      "totalViews": 12
    },
    {
      "_id": "45+",
      "totalPosts": 12,
      "totalComments": 12,
      "totalLikes": 21,
      "totalViews": 12
    }
  ];
  
