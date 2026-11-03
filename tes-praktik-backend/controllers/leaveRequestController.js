import * as leaveRequestService from "../services/leaveRequestService.js";

const listLeaveRequests = async (req, res, next) => {
    try {
        const requests = await leaveRequestService.getLeaveRequests(req.user);

        res.status(200).json({
            success: true,
            data: {
                leave_requests: requests
            }
        });
    } catch (error) {
        next(error);
    }
};

const listPendingRequests = async (req, res, next) => {
    try {
        const requests = await leaveRequestService.getPendingRequests(
            req.user.division_id
        );

        res.status(200).json({
            success: true,
            data: {
                leave_requests: requests
            }
        });
    } catch (error) {
        next(error);
    }
};

const getLeaveRequest = async (req, res, next) => {
    try {
        const request = await leaveRequestService.getLeaveRequestById(
            req.params.id,
            req.user
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found."
            });
        }

        res.status(200).json({
            success: true,
            data: { leave_request: request }
        });
    } catch (error) {
        next(error);
    }
};

const submitLeaveRequest = async (req, res, next) => {
    try {
        const { start_date, end_date, reason } = req.body;

        if (!start_date || !end_date || !reason) {
            return res.status(400).json({
                success: false,
                message: "Start date, end date, and reason are required."
            });
        }

        const requestId = await leaveRequestService.createLeaveRequest(
            req.user,
            { start_date, end_date, reason }
        );

        const request = await leaveRequestService.getLeaveRequestById(
            requestId,
            req.user
        );

        res.status(201).json({
            success: true,
            message: "Leave request submitted successfully.",
            data: { leave_request: request }
        });
    } catch (error) {
        next(error);
    }
};

const approveLeaveRequest = async (req, res, next) => {
    try {
        await leaveRequestService.processLeaveRequest(
            req.params.id,
            req.user,
            "APPROVED"
        );

        res.status(200).json({
            success: true,
            message: "Leave request approved successfully."
        });
    } catch (error) {
        next(error);
    }
};

const rejectLeaveRequest = async (req, res, next) => {
    try {
        await leaveRequestService.processLeaveRequest(
            req.params.id,
            req.user,
            "REJECTED"
        );

        res.status(200).json({
            success: true,
            message: "Leave request rejected successfully."
        });
    } catch (error) {
        next(error);
    }
};

export {
    listLeaveRequests,
    listPendingRequests,
    getLeaveRequest,
    submitLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest
};
