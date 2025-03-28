import { createClient } from '@supabase/supabase-js'
import io from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const socket = io(API_URL)

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

class LeaderboardService {
  // Fetch leaderboard data with optional filters
  async getLeaderboard(timeFilter = 'all', sortBy = 'score') {
    try {
      let query = supabase.from('leaderboard').select('*')
      
      // Apply time filter
      if (timeFilter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        query = query.gte('updated_at', oneWeekAgo.toISOString());
      } else if (timeFilter === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        query = query.gte('updated_at', oneMonthAgo.toISOString());
      }
      
      // Apply sorting
      let sortField = 'score';
      if (sortBy === 'streak') {
        sortField = 'max_streak';
      } else if (sortBy === 'completion') {
        sortField = 'completion_rate';
      }
      
      // Add a timeout promise to handle slow connections
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 5000)
      );
      
      // Execute query with timeout
      const queryPromise = query
        .order(sortField, { ascending: false })
        .limit(10);
      
      // Race between the query and the timeout
      const { data, error } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]);

      if (error) throw error
      
      // Check if data is null or undefined (might happen with timeout)
      if (!data) {
        console.log('No data returned from leaderboard query, using fallback data');
        return this.getFallbackLeaderboardData();
      }
      
      // Add rank to each player
      const rankedData = data.map((player, index) => ({
        ...player,
        rank: index + 1,
        // If badges field doesn't exist, provide empty array
        badges: player.badges || []
      }))
      
      return rankedData
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      // Return fallback data instead of throwing
      return this.getFallbackLeaderboardData();
    }
  }

  // Subscribe to real-time leaderboard updates
  subscribeToUpdates(callback) {
    socket.on('leaderboard-update', (data) => {
      callback(data)
    })

    return () => {
      socket.off('leaderboard-update')
    }
  }

  // Update player score
  async updateScore(userId, scoreData) {
    try {
      const { score, streak } = scoreData
      
      // First try Supabase
      try {
        // First check if user already has a leaderboard entry
        const existingData = await this.getUserScore(userId)
        
        if (existingData) {
          const newScore = existingData.score + score
          const maxStreak = Math.max(existingData.max_streak || 0, streak || 0)
          
          const { data, error } = await supabase
            .from('leaderboard')
            .update({
              score: newScore,
              max_streak: maxStreak,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
          
          if (error) {
            console.warn('Supabase update score error, falling back to localStorage:', error)
            throw error
          }
          
          return data
        } else {
          const { data, error } = await supabase
            .from('leaderboard')
            .insert([{
              user_id: userId,
              score: score || 0,
              max_streak: streak || 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
          
          if (error) {
            console.warn('Supabase insert score error, falling back to localStorage:', error)
            throw error
          }
          
          return data
        }
      } catch (supabaseError) {
        // Fall back to localStorage
        const storageKey = `leaderboard_${userId}`
        
        // Get existing data or initialize
        let userData = JSON.parse(localStorage.getItem(storageKey) || 'null')
        
        if (userData) {
          // Update existing entry
          userData.score += (score || 0)
          userData.max_streak = Math.max(userData.max_streak || 0, streak || 0)
          userData.updated_at = new Date().toISOString()
        } else {
          // Create new entry
          userData = {
            id: Date.now().toString(), // Generate a unique ID
            user_id: userId,
            score: score || 0,
            max_streak: streak || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
        
        // Save back to localStorage
        localStorage.setItem(storageKey, JSON.stringify(userData))
        console.log('Score saved to localStorage fallback')
        
        return userData
      }
    } catch (error) {
      console.error('Error updating score:', error)
      return null
    }
  }

  // Add badge to player
  async addBadge(userId, badgeName, badgeDescription = '') {
    try {
      // First try Supabase
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .insert([{
            user_id: userId,
            name: badgeName,
            description: badgeDescription,
            earned_at: new Date().toISOString()
          }])
        
        if (error) {
          console.warn('Supabase add badge error, falling back to localStorage:', error)
          throw error
        }
        
        return data
      } catch (supabaseError) {
        // Fall back to localStorage
        const storageKey = `user_achievements_${userId}`
        let existingAchievements = JSON.parse(localStorage.getItem(storageKey) || '[]')
        
        // Check if badge already exists
        const badgeExists = existingAchievements.some(
          badge => badge.user_id === userId && badge.name === badgeName
        )
        
        if (!badgeExists) {
          // Add new badge
          const newBadge = {
            id: Date.now().toString(), // Generate a unique ID
            user_id: userId,
            name: badgeName,
            description: badgeDescription,
            earned_at: new Date().toISOString()
          }
          
          existingAchievements.push(newBadge)
          localStorage.setItem(storageKey, JSON.stringify(existingAchievements))
          console.log('Badge saved to localStorage fallback')
        }
        
        return existingAchievements
      }
    } catch (error) {
      console.error('Error adding badge:', error)
      return []
    }
  }

  async getUserScore(userId) {
    try {
      // First try Supabase
      try {
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            // No record found
            return null
          }
          console.warn('Supabase get user score error, falling back to localStorage:', error)
          throw error
        }

        return data
      } catch (supabaseError) {
        // Fall back to localStorage
        const storageKey = `leaderboard_${userId}`
        const userData = JSON.parse(localStorage.getItem(storageKey) || 'null')
        
        console.log('Retrieved user score from localStorage fallback:', userData)
        return userData
      }
    } catch (error) {
      console.error('Error fetching user score:', error)
      return null
    }
  }

  async getUserAchievements(userId) {
    try {
      // First try Supabase
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId)
          .order('earned_at', { ascending: false })
        
        if (error) {
          console.warn('Supabase get achievements error, falling back to localStorage:', error)
          throw error
        }
        
        return data || []
      } catch (supabaseError) {
        // Fall back to localStorage
        const storageKey = `user_achievements_${userId}`
        const achievements = JSON.parse(localStorage.getItem(storageKey) || '[]')
        
        // Filter achievements for this user and sort by earned_at
        const userAchievements = achievements
          .filter(a => a.user_id === userId)
          .sort((a, b) => new Date(b.earned_at) - new Date(a.earned_at))
        
        console.log('Retrieved achievements from localStorage fallback:', userAchievements)
        return userAchievements
      }
    } catch (error) {
      console.error('Error fetching user achievements:', error)
      return []
    }
  }

  async getUserRank(userId) {
    try {
      // Add a timeout of 4 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User rank request timed out')), 4000)
      );
      
      // Define the data fetching function
      const fetchRankData = async () => {
        // First try Supabase
        try {
          // Get all players to calculate rank
          const { data: allPlayers, error: playersError } = await supabase
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })

          if (playersError) {
            console.warn('Supabase get all players error, falling back to alternative method:', playersError)
            throw playersError
          }

          // Get user's leaderboard entry
          const { data: userData, error: userError } = await supabase
            .from('leaderboard')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.warn('Supabase get user error, falling back to alternative method:', userError)
            throw userError
          }

          // If user not found in leaderboard, return default values
          if (!userData || userError) {
            return {
              user_id: userId,
              rank: '-',
              totalPlayers: allPlayers?.length || 0,
              score: 0,
              max_streak: 0,
              completion_rate: 0
            }
          }

          // Calculate rank
          const userRank = allPlayers.findIndex(player => player.user_id === userId) + 1

          return {
            ...userData,
            rank: userRank || '-',
            totalPlayers: allPlayers.length
          }
        } catch (supabaseError) {
          // Fall back to localStorage
          const storageKey = `leaderboard_${userId}`
          const userData = JSON.parse(localStorage.getItem(storageKey) || 'null')
          
          if (!userData) {
            // If no data exists, return default values
            return {
              user_id: userId,
              rank: '-',
              totalPlayers: 0,
              score: 0,
              max_streak: 0,
              completion_rate: 0
            }
          }
          
          // Try to estimate rank from localStorage (less accurate)
          return {
            ...userData,
            rank: userData.rank || '-',
            totalPlayers: 10 // Placeholder value
          }
        }
      };
      
      // Race between data fetching and timeout
      return await Promise.race([
        fetchRankData(),
        timeoutPromise
      ]);
      
    } catch (error) {
      console.error('Error getting user rank:', error)
      // Return default object with placeholder values
      return {
        user_id: userId,
        rank: '-',
        totalPlayers: 0,
        score: 0,
        max_streak: 0,
        completion_rate: 0
      }
    }
  }

  async getMostImprovedPlayers(limit = 3, period = 'week') {
    try {
      // Add a timeout of 3 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Most improved players request timed out')), 3000)
      );
      
      const fetchImprovedPlayersData = async () => {
        // Calculate the date for our period
        const startDate = new Date();
        if (period === 'week') {
          startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'month') {
          startDate.setMonth(startDate.getMonth() - 1);
        } else {
          // Default to 30 days if period is not recognized
          startDate.setDate(startDate.getDate() - 30);
        }
        
        // Get players with score history
        const { data: scoreHistory, error: historyError } = await supabase
          .from('score_history')
          .select('user_id, score, created_at')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true });
          
        if (historyError) throw historyError;
        
        if (!scoreHistory || scoreHistory.length === 0) {
          // Fall back to current leaderboard data
          const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .limit(limit);
            
          if (error) throw error;
          
          if (!data || data.length === 0) {
            // Return fallback data if no data is available
            return this.getFallbackImprovedPlayers(limit);
          }
          
          return data.map((player, index) => ({
            ...player,
            improvement: 0,
            rank: index + 1
          }));
        }
        
        // Group by user and calculate score difference
        const userScoreMap = {};
        
        scoreHistory.forEach(record => {
          if (!userScoreMap[record.user_id]) {
            userScoreMap[record.user_id] = {
              firstScore: record.score,
              lastScore: record.score,
              dates: [record.created_at]
            };
          } else {
            userScoreMap[record.user_id].lastScore = record.score;
            userScoreMap[record.user_id].dates.push(record.created_at);
          }
        });
        
        // Calculate improvement for each user
        const improvements = Object.keys(userScoreMap).map(userId => {
          const { firstScore, lastScore } = userScoreMap[userId];
          const improvement = lastScore - firstScore;
          return { 
            user_id: userId, 
            improvement,
            improvement_percent: firstScore > 0 ? (improvement / firstScore) * 100 : 0
          };
        });
        
        // Sort by improvement (highest first)
        improvements.sort((a, b) => b.improvement - a.improvement);
        
        // Get top improved users' details
        const topImprovedUserIds = improvements
          .slice(0, limit)
          .map(item => item.user_id);
          
        if (topImprovedUserIds.length === 0) {
          return this.getFallbackImprovedPlayers(limit);
        }
          
        // Get full details for these users
        const { data: userData, error: userError } = await supabase
          .from('leaderboard')
          .select('*')
          .in('user_id', topImprovedUserIds);
          
        if (userError) throw userError;
        
        if (!userData || userData.length === 0) {
          return this.getFallbackImprovedPlayers(limit);
        }
        
        // Combine user data with improvement metrics
        return userData.map(user => {
          const improvementData = improvements.find(imp => imp.user_id === user.user_id);
          return {
            ...user,
            improvement: improvementData.improvement,
            improvement_percent: improvementData.improvement_percent
          };
        });
      }; // end of fetchImprovedPlayersData
      
      // Race between data fetching and timeout
      return await Promise.race([
        fetchImprovedPlayersData(),
        timeoutPromise
      ]);
      
    } catch (error) {
      console.error('Error getting most improved players:', error);
      return this.getFallbackImprovedPlayers(limit);
    }
  }
  
  // Fallback data for most improved players
  getFallbackImprovedPlayers(limit = 3) {
    const data = [
      {
        id: 101,
        user_id: 'improved-1',
        name: 'Alex Martinez',
        score: 8500,
        improvement: 2000,
        improvement_percent: 30.8,
        rank: 1
      },
      {
        id: 102,
        user_id: 'improved-2',
        name: 'Taylor Wong',
        score: 7200,
        improvement: 1500,
        improvement_percent: 26.3,
        rank: 2
      },
      {
        id: 103,
        user_id: 'improved-3',
        name: 'Jordan Smith',
        score: 6700,
        improvement: 1200,
        improvement_percent: 21.8,
        rank: 3
      },
      {
        id: 104,
        user_id: 'improved-4',
        name: 'Casey Lin',
        score: 5900,
        improvement: 900,
        improvement_percent: 18.0,
        rank: 4
      },
      {
        id: 105,
        user_id: 'improved-5',
        name: 'Riley Johnson',
        score: 5300,
        improvement: 700,
        improvement_percent: 15.2,
        rank: 5
      }
    ];
    
    return data.slice(0, limit);
  }

  async getFriendsLeaderboard(userId) {
    try {
      // Add a timeout of 3 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Friends leaderboard request timed out')), 3000)
      );
      
      const fetchFriendsLeaderboardData = async () => {
        // First get the user's friends
        const { data: friendsData, error: friendsError } = await supabase
          .from('user_friends')
          .select('friend_id')
          .eq('user_id', userId);
          
        if (friendsError) throw friendsError;
        
        // If the user has no friends, return empty array
        if (!friendsData || friendsData.length === 0) {
          return [];
        }
        
        // Extract friend IDs
        const friendIds = friendsData.map(f => f.friend_id);
        
        // Include the user's own ID
        friendIds.push(userId);
        
        // Get leaderboard data for these users
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .in('user_id', friendIds)
          .order('score', { ascending: false });
          
        if (error) throw error;
        
        // Add rank to each player
        const rankedData = data.map((player, index) => ({
          ...player,
          rank: index + 1,
          badges: player.badges || []
        }));
        
        return rankedData;
      };
      
      // Race between data fetching and timeout
      return await Promise.race([
        fetchFriendsLeaderboardData(),
        timeoutPromise
      ]);
      
    } catch (error) {
      console.error('Error fetching friends leaderboard:', error);
      
      // Return empty array instead of throwing - UI will handle empty state
      return [];
    }
  }

  async getAvailableAchievements() {
    try {
      // Get all possible achievements from Supabase
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching available achievements:', error);
      
      // Fallback to default achievements if database fails
      return [
        {
          id: 'first_lesson',
          name: 'First Steps',
          description: 'Complete your first lesson',
          icon: 'footprints',
          category: 'progress',
          points: 10,
          requirements: { lessons_completed: 1 }
        },
        {
          id: 'streak_7',
          name: 'Weekly Warrior',
          description: 'Maintain a 7-day streak',
          icon: 'fire',
          category: 'streaks',
          points: 50,
          requirements: { streak_days: 7 }
        },
        {
          id: 'score_1000',
          name: 'Point Collector',
          description: 'Earn 1,000 points',
          icon: 'trophy',
          category: 'score',
          points: 25,
          requirements: { min_score: 1000 }
        },
        {
          id: 'perfect_quiz',
          name: 'Perfect Score',
          description: 'Get 100% on any quiz',
          icon: 'star',
          category: 'quizzes',
          points: 30,
          requirements: { quiz_score: 100 }
        },
        {
          id: 'social_butterfly',
          name: 'Social Butterfly',
          description: 'Add 5 friends',
          icon: 'users',
          category: 'social',
          points: 40,
          requirements: { friends_count: 5 }
        }
      ];
    }
  }
  
  async checkAchievementEligibility(userId) {
    try {
      // Get user statistics
      const userStats = await this.getUserStatistics(userId);
      if (!userStats) return [];
      
      // Get user's existing achievements
      const existingAchievements = await this.getUserAchievements(userId);
      const earnedAchievementIds = existingAchievements.map(a => a.achievement_id);
      
      // Get all available achievements
      const availableAchievements = await this.getAvailableAchievements();
      
      // Filter out achievements the user has already earned
      const unearnedAchievements = availableAchievements.filter(
        achievement => !earnedAchievementIds.includes(achievement.id)
      );
      
      // Check each achievement's requirements against user stats
      const newlyQualifiedAchievements = [];
      
      for (const achievement of unearnedAchievements) {
        const requirements = achievement.requirements || {};
        let qualifies = true;
        
        // Check each requirement
        if (requirements.min_score && userStats.score < requirements.min_score) {
          qualifies = false;
        }
        
        if (requirements.streak_days && userStats.current_streak < requirements.streak_days) {
          qualifies = false;
        }
        
        if (requirements.lessons_completed && userStats.lessons_completed < requirements.lessons_completed) {
          qualifies = false;
        }
        
        if (requirements.quiz_score && userStats.highest_quiz_score < requirements.quiz_score) {
          qualifies = false;
        }
        
        if (requirements.friends_count) {
          const friendCount = await this.getFriendCount(userId);
          if (friendCount < requirements.friends_count) {
            qualifies = false;
          }
        }
        
        // If user qualifies, add to the list
        if (qualifies) {
          newlyQualifiedAchievements.push(achievement);
        }
      }
      
      return newlyQualifiedAchievements;
    } catch (error) {
      console.error('Error checking achievement eligibility:', error);
      return [];
    }
  }
  
  async getUserStatistics(userId) {
    try {
      // Get user stats from Supabase
      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No record found
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      
      // Try to get basic stats from other sources
      try {
        const leaderboardData = await this.getUserScore(userId);
        const coursesCompleted = await this.getLessonsCompleted(userId);
        
        return {
          user_id: userId,
          score: leaderboardData?.score || 0,
          current_streak: leaderboardData?.max_streak || 0,
          lessons_completed: coursesCompleted || 0,
          highest_quiz_score: 0 // Default if we can't get this info
        };
      } catch (fallbackError) {
        console.error('Error getting fallback statistics:', fallbackError);
        return null;
      }
    }
  }
  
  async getLessonsCompleted(userId) {
    // This is a placeholder - you would implement this based on your data structure
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed');
        
      if (error) throw error;
      
      return data?.length || 0;
    } catch (error) {
      console.error('Error fetching lessons completed:', error);
      return 0;
    }
  }
  
  async getFriendCount(userId) {
    try {
      const { data, error } = await supabase
        .from('user_friends')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'accepted');
        
      if (error) throw error;
      
      return data?.length || 0;
    } catch (error) {
      console.error('Error fetching friend count:', error);
      return 0;
    }
  }
  
  async awardAchievement(userId, achievementId) {
    try {
      // Get achievement details
      const { data: achievementData, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();
        
      if (achievementError) throw achievementError;
      
      // Award the achievement
      const { data, error } = await supabase
        .from('user_achievements')
        .insert([{
          user_id: userId,
          achievement_id: achievementId,
          name: achievementData.name,
          description: achievementData.description,
          icon: achievementData.icon,
          points: achievementData.points,
          earned_at: new Date().toISOString()
        }]);
        
      if (error) throw error;
      
      // Add points to user's score
      await this.updateScore(userId, { score: achievementData.points || 0 });
      
      return data;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return null;
    }
  }

  // Fallback data for when the leaderboard can't be fetched
  getFallbackLeaderboardData() {
    return [
      {
        id: 1,
        user_id: 'fallback-1',
        name: 'Sarah Johnson',
        score: 15000,
        max_streak: 30,
        completion_rate: 85,
        badges: ['Math Master', 'Science Whiz', 'Language Expert'],
        rank: 1
      },
      {
        id: 2,
        user_id: 'fallback-2',
        name: 'Michael Chen',
        score: 14500,
        max_streak: 25,
        completion_rate: 80,
        badges: ['History Buff', 'Literature Pro'],
        rank: 2
      },
      {
        id: 3,
        user_id: 'fallback-3',
        name: 'Emily Rodriguez',
        score: 14000,
        max_streak: 20,
        completion_rate: 75,
        badges: ['Quiz Champion', 'Perfect Attendance'],
        rank: 3
      },
      {
        id: 4,
        user_id: 'fallback-4',
        name: 'James Wilson',
        score: 13500,
        max_streak: 15,
        completion_rate: 70,
        badges: ['Rising Star'],
        rank: 4
      },
      {
        id: 5,
        user_id: 'fallback-5',
        name: 'Lisa Thompson',
        score: 13000,
        max_streak: 10,
        completion_rate: 65,
        badges: ['Quick Learner'],
        rank: 5
      }
    ];
  }
}

export default new LeaderboardService()