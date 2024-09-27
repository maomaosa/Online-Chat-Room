const RESOURCE_TYPE = {
  TRAFFIC: "traffic",
  WORKPLACE: "workplace",
  MEDICAL: "medical",
  HOME: "home",
  MISSING: "missing",
};

const RESOURCE_TYPE_OPTION = [
  { value: RESOURCE_TYPE.TRAFFIC },
  { value: RESOURCE_TYPE.WORKPLACE },
  { value: RESOURCE_TYPE.MEDICAL },
  { value: RESOURCE_TYPE.HOME },
  { value: RESOURCE_TYPE.MISSING },
];

const RESOURCE_REQUEST_STATUS = {
  SENT: 0,
  APPROVED: 1,
  DECLINED: 2,
  CLOSED: 3,
};

const RESOURCE_REQUEST_STATUS_OPTION = [
  { value: "sent" },
  { value: "approved" },
  { value: "declined" },
  { value: "closed" },
];

const ROUTER_PREFIX = "https://s24esnb4.onrender.com";
//const ROUTER_PREFIX = "http://localhost:3000";
