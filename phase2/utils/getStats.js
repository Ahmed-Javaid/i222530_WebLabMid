/**
 * getStats — Aggregation utility for dashboard statistics
 *
 * Exports a single async function that runs ONE aggregation pipeline
 * on the Task collection to compute totalActive, totalCritical, and
 * completedToday.  totalVolunteers is fetched separately via
 * Volunteer.countDocuments() since Mongoose doesn't support
 * cross-collection $lookup counts cleanly.
 */

const Task = require('../models/Task');
const Volunteer = require('../models/Volunteer');

async function getStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Single aggregation pipeline on the Task collection
  const [pipeline] = await Task.aggregate([
    {
      $facet: {
        totalActive: [
          { $match: { status: 'active' } },
          { $count: 'count' }
        ],
        totalCritical: [
          { $match: { priority: 'critical' } },
          { $count: 'count' }
        ],
        completedToday: [
          { $match: { status: 'completed', updatedAt: { $gte: todayStart } } },
          { $count: 'count' }
        ]
      }
    },
    {
      $project: {
        totalActive: {
          $ifNull: [{ $arrayElemAt: ['$totalActive.count', 0] }, 0]
        },
        totalCritical: {
          $ifNull: [{ $arrayElemAt: ['$totalCritical.count', 0] }, 0]
        },
        completedToday: {
          $ifNull: [{ $arrayElemAt: ['$completedToday.count', 0] }, 0]
        }
      }
    }
  ]);

  // Separate countDocuments for volunteers (cross-collection)
  const totalVolunteers = await Volunteer.countDocuments();

  return {
    activeTasks: pipeline.totalActive,
    criticalTasks: pipeline.totalCritical,
    completedToday: pipeline.completedToday,
    totalVolunteers
  };
}

module.exports = getStats;
