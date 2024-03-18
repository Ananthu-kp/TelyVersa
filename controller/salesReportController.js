const Order= require("../model/orderModel")
const PDFDocument= require("pdfkit")
const moment= require("moment")
const ExcelJS= require("exceljs")



// const calculateOverallSalesCount = async () => {
//     try {
//         const salesCount = await Order.countDocuments({ status: "Delivered" });
//         return salesCount;
//     } catch (error) {
//         console.log(error.message);
//         return 0;
//     }
// }

// const calculateOverallOrderAmount = async () => {
//     try {
//         const orders = await Order.find({ status: "Delivered" });
//         let totalAmount = 0;
//         orders.forEach(order => {
//             totalAmount += order.totalPrice;
//         });
//         return totalAmount;
//     } catch (error) {
//         console.log(error.message);
//         return 0;
//     }
// }

// const calculateOverallDiscount = async () => {
//     try {
//         const orders = await Order.find({ status: "Delivered" });
//         let totalDiscount = 0;
//         orders.forEach(order => {
//             totalDiscount += order.discount;
//             totalDiscount += order.couponDeduction;
//         });
//         return totalDiscount;
//     } catch (error) {
//         console.log(error.message);
//         return 0;
//     }
// }

const calculateOverallSalesSummary = async (startDate, endDate) => {
    try {
        const salesCount = await Order.countDocuments({ 
            status: "Delivered",
            createdOn: {
                $gte: startDate,
                $lt: endDate
            }
        });
        const orders = await Order.find({ 
            status: "Delivered",
            createdOn: {
                $gte: startDate,
                $lt: endDate
            }
        });
        let totalAmount = 0;
        let totalDiscount = 0;
        orders.forEach(order => {
            totalAmount += order.totalPrice;
            totalDiscount += order.discount;
            totalDiscount += order.couponDeduction;
        });
        return { salesCount, totalAmount, totalDiscount };
    } catch (error) {
        console.log(error.message);
        return { salesCount: 0, totalAmount: 0, totalDiscount: 0 };
    }
}

const getSalesReportPage = async (req, res) => {
    try {
        let filterBy = req.query.day
        if (filterBy) {
            res.redirect(`/admin/${req.query.day}`)
        } else {
            res.redirect(`/admin/salesMonthly`)
        }
    } catch (error) {
        console.log(error.message);
    }
}

const salesToday = async (req, res) => {
    try {
        let today = new Date()
        const startOfTheDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            0,
            0,
            0,
            0
        )

        const endOfTheDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            23,
            59,
            59,
            999
        )

        const orders = await Order.aggregate([
            {
                $match: {
                    createdOn: {
                        $gte: startOfTheDay,
                        $lt: endOfTheDay
                    },
                    status: "Delivered"
                }
            }
        ]).sort({ createdOn: -1 })


        let itemsPerPage = 5
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(orders.length / 3)
        const currentOrder = orders.slice(startIndex, endIndex)

        console.log(currentOrder, "currOrder");

        const { salesCount, totalAmount, totalDiscount } = await calculateOverallSalesSummary(startOfTheDay, endOfTheDay);
       
        res.render("admin/salesReport", { 
             data: currentOrder,
             totalPages, 
             currentPage, 
             salesToday: true ,
             overallSalesCount:salesCount, 
             overallOrderAmount:totalAmount, 
             overallDiscount:totalDiscount,
             salereport:true})

    } catch (error) {
        console.log(error.message);
    }
}


const salesWeekly = async (req, res) => {
    try {
        let currentDate = new Date()
        const startOfTheWeek = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() - currentDate.getDay()
        )

        const endOfTheWeek = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() + (6 - currentDate.getDay()),
            23,
            59,
            59,
            999
        )

        const orders = await Order.aggregate([
            {
                $match: {
                    createdOn: {
                        $gte: startOfTheWeek,
                        $lt: endOfTheWeek
                    },
                    status: "Delivered"
                }
            }
        ]).sort({ createdOn: -1 })

        let itemsPerPage = 5
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(orders.length / 3)
        const currentOrder = orders.slice(startIndex, endIndex)

        const startOfTheDay = startOfTheWeek;
        const endOfTheDay = endOfTheWeek;

        const { salesCount, totalAmount, totalDiscount } = await calculateOverallSalesSummary(startOfTheDay, endOfTheDay);
        console.log(salesCount,"salecountffafkhfwhfjhfwh");
        console.log(totalAmount,"amount dcdsdbdbdshhjdghjb");
        console.log(totalDiscount,"fagsfjasghjgashjggyu");


        res.render("admin/salesReport", { 
            data: currentOrder, totalPages, 
            currentPage, 
            salesWeekly: true ,
            overallSalesCount:salesCount, 
            overallOrderAmount:totalAmount, 
            overallDiscount:totalDiscount,
            salereport:true})

    } catch (error) {
        console.log(error.message);
    }
}


const salesMonthly = async (req, res) => {
    try {
        let currentMonth = new Date().getMonth() + 1
        const startOfTheMonth = new Date(
            new Date().getFullYear(),
            currentMonth - 1,
            1, 0, 0, 0, 0
        )
        const endOfTheMonth = new Date(
            new Date().getFullYear(),
            currentMonth,
            0, 23, 59, 59, 999
        )
        const orders = await Order.aggregate([
            {
                $match: {
                    createdOn: {
                        $gte: startOfTheMonth,
                        $lt: endOfTheMonth
                    },
                    status: "Delivered"
                }
            }
        ]).sort({ createdOn: -1 })
        // .then(data=>console.log(data))
        console.log("ethi");
        console.log(orders);

        const startOfTheDay = startOfTheMonth;
        const endOfTheDay = endOfTheMonth;

        let itemsPerPage = 5
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(orders.length / 3)
        const currentOrder = orders.slice(startIndex, endIndex)

        const { salesCount, totalAmount, totalDiscount } = await calculateOverallSalesSummary(startOfTheDay, endOfTheDay);

        res.render("admin/salesReport", { 
            data: currentOrder, 
            totalPages, currentPage, 
            salesMonthly: true ,
            overallSalesCount:salesCount, 
            overallOrderAmount:totalAmount, 
            overallDiscount:totalDiscount,
            salereport:true})


    } catch (error) {
        console.log(error.message);
    }
}


const salesYearly = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear()
        const startofYear = new Date(currentYear, 0, 1, 0, 0, 0, 0)
        const endofYear = new Date(currentYear, 11, 31, 23, 59, 59, 999)

        const orders = await Order.aggregate([
            {
                $match: {
                    createdOn: {
                        $gte: startofYear,
                        $lt: endofYear
                    },
                    status: "Delivered"
                }
            }
        ])

        const startOfTheDay = startofYear;
        const endOfTheDay = endofYear;
        let itemsPerPage = 5
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(orders.length / 3)
        const currentOrder = orders.slice(startIndex, endIndex)

        const { salesCount, totalAmount, totalDiscount } = await calculateOverallSalesSummary(startOfTheDay, endOfTheDay);

        res.render("admin/salesReport", { 
            data: currentOrder, 
            totalPages, 
            currentPage, 
            salesYearly: true ,
            overallSalesCount:salesCount, 
            overallOrderAmount:totalAmount, 
            overallDiscount:totalDiscount,
            salereport:true})

    } catch (error) {
        console.log(error.message);
    }
}



const generatePdf = async (req, res) => {
    try {
        const doc = new PDFDocument();
        const filename = 'sales-report.pdf';
        const orders = req.body;
        // console.log(orders);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        doc.pipe(res);
        doc.fontSize(12);
        doc.text('Sales Report', { align: 'center', fontSize: 16 });
        const margin = 5;
        doc
            .moveTo(margin, margin)
            .lineTo(600 - margin, margin)
            .lineTo(600 - margin, 842 - margin)
            .lineTo(margin, 842 - margin)
            .lineTo(margin, margin)
            .lineTo(600 - margin, margin)
            .lineWidth(3)
            .strokeColor('#000000')
            .stroke();

        doc.moveDown();



        //   console.log("nothing");

        const headers = ['Order ID', 'Name', 'Date', 'Total'];

        let headerX = 20;
        const headerY = doc.y + 10;

        doc.text(headers[0], headerX, headerY);
        headerX += 200;

        headers.slice(1).forEach(header => {
            doc.text(header, headerX, headerY);
            headerX += 130;
        });

        let dataY = headerY + 25;

        orders.forEach(order => {
            const cleanedDataId = order.dataId.trim();
            const cleanedName = order.name.trim();

            doc.text(cleanedDataId, 20, dataY, { width: 200 });
            doc.text(cleanedName, 230, dataY);
            doc.text(order.date, 350, dataY, { width: 120 });
            doc.text(order.totalAmount, 490, dataY);

            dataY += 30;
        });



        doc.end();
    } catch (error) {
        console.log(error.message);
    }
}


const downloadExcel = async (req, res) => {
    try {
        // Fetch orders from the database
        const orders = await Order.find({ status: 'Delivered' });

        // Create a new Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Define the columns and column headers
        worksheet.columns = [
            { header: 'Order ID', key: '_id', width: 30 },
            { header: 'Customer', key: 'userId', width: 30 },
            { header: 'Date', key: 'createdOn', width: 30 },
            { header: 'Total', key: 'totalPrice', width: 15 },
            { header: 'Payment', key: 'address[0].payment', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Coupon Deduction', key: 'couponDeduction', width: 15 },
        ];

        // Add rows to the worksheet based on the fetched orders
        orders.forEach((order, index) => {
            worksheet.addRow({
                _id: order._id,
                userId: order.userId,
                createdOn: order.createdOn.toISOString(), // Format date as needed
                totalPrice: order.totalPrice,
                'address[0].payment': order.payment,
                status: order.status,
                couponDeduction: order.couponDeduction,
            });
        });

        // Set the response headers for Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=salesReport.xlsx');

        // Write the workbook to the response and end the response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generating Excel file:', error.message);
        res.status(500).send('Error generating Excel file');
    }
};





const dateWiseFilter = async (req, res) => {
    try {
        console.log(req.query);
        const date = moment(req.query.date).startOf('day').toDate();

        const startOfTheDay = moment(date).startOf('day').toDate();
        const endOfTheDay = moment(date).endOf('day').toDate();

        const orders = await Order.aggregate([
            {
                $match: {
                    createdOn: {
                        $gte: moment(date).startOf('day').toDate(),
                        $lt: moment(date).endOf('day').toDate(),
                    },
                    status: "Delivered"
                }
            }
        ]);

        console.log(orders);

        let itemsPerPage = 5
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage - 1) * itemsPerPage
        let endIndex = startIndex + itemsPerPage
        let totalPages = Math.ceil(orders.length / 3)
        const currentOrder = orders.slice(startIndex, endIndex)

        const { salesCount, totalAmount, totalDiscount } = await calculateOverallSalesSummary(startOfTheDay, endOfTheDay);

        res.render("admin/salesReport", { 
            data: currentOrder, 
            totalPages, 
            currentPage, 
            salesMonthly: true, 
            date ,
            overallSalesCount:salesCount, 
            overallOrderAmount:totalAmount, 
            overallDiscount:totalDiscount,
            salereport:true})


    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    getSalesReportPage,
    salesToday,
    salesWeekly,
    salesMonthly,
    salesYearly,
    dateWiseFilter,
    generatePdf,
    downloadExcel
}