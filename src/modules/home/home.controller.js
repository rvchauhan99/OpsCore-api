"use strict";

const { asyncHandler } = require("../../common/utils/asyncHandler.js");
const responseHandler = require("../../common/utils/responseHandler.js");
const homeService = require("./home.service.js");

const normalizeDashboardFilters = (query = {}) => {
  const {
    customer_name = null,
    mobile_number = null,
    consumer_no = null,
    application_no = null,
    reference_from = null,
    branch_id = null,
    inquiry_source_id = null,
    order_number = null,
    order_date_from = null,
    order_date_to = null,
    status = null,
    current_stage_key = null,
    project_scheme_id = null,
  } = query;

  let from = order_date_from;
  let to = order_date_to;
  if (!from && !to) {
    const today = new Date();
    const toDate = today.toISOString().slice(0, 10);
    const fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    from = fromDate;
    to = toDate;
  }

  return {
    customer_name,
    mobile_number,
    consumer_no,
    application_no,
    reference_from,
    branch_id,
    inquiry_source_id,
    order_number,
    order_date_from: from,
    order_date_to: to,
    status,
    current_stage_key,
    project_scheme_id,
  };
};

const dashboardKpis = asyncHandler(async (req, res) => {
  void normalizeDashboardFilters(req.query || {});
  const result = await homeService.getDashboardKpis();
  return responseHandler.sendSuccess(res, result, "Dashboard KPIs fetched", 200);
});

const dashboardPipeline = asyncHandler(async (req, res) => {
  void normalizeDashboardFilters(req.query || {});
  const result = await homeService.getDashboardPipeline();
  return responseHandler.sendSuccess(res, result, "Dashboard pipeline fetched", 200);
});

const dashboardTrend = asyncHandler(async (req, res) => {
  void normalizeDashboardFilters(req.query || {});
  const result = await homeService.getDashboardTrend();
  return responseHandler.sendSuccess(res, result, "Dashboard trend fetched", 200);
});

const dashboardOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  void normalizeDashboardFilters(req.query || {});
  const result = await homeService.listDashboardOrders({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  });
  return responseHandler.sendSuccess(res, result, "Dashboard orders list fetched", 200);
});

module.exports = {
  dashboardKpis,
  dashboardPipeline,
  dashboardTrend,
  dashboardOrders,
};
