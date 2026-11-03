import { getDashboardSummaryService } from "../services/dashboardService.js";

const getDashboardSummary = async (req, res, next) => {
    try {
        const summary = await getDashboardSummaryService(req.user);

        res.status(200).json({
            success: true,
            message: "Dashboard summary retrieved successfully",
            data: summary,
        });
    } catch (error) {
        next(error);
    }
};

export { getDashboardSummary };