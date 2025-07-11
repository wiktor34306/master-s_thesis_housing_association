import adminEndpoint from "./admin.endpoint";
import userEndpoint from "./user.endpoint";
import loginEndpoint from "./login.endpoint"
import housingAssociationEndpoint from "./housingAssociation.endpoint"
import advertisementEndpoint from "./advertisement.endpoint";
import eventEndpoint from "./event.endpoint";
import residentEndpoint from "./resident.endpoint";
import workerEndpoint from "./worker.endpoint";
import reportEndpoint from "./report.endpoint";
import notificationEndpoint from "./notification.endpoint";
import generateInvoicePdfEndpoint from "./generateInvoicePdf.endpoint";

const routes = function (router)
{
    adminEndpoint(router);
    userEndpoint(router);
    loginEndpoint(router);
    housingAssociationEndpoint(router);
    advertisementEndpoint(router);
    eventEndpoint(router);
    residentEndpoint(router);
    workerEndpoint(router);
    reportEndpoint(router);
    notificationEndpoint(router);
    generateInvoicePdfEndpoint(router);
};

export default routes;