const express = require('express');
const router = express.Router();
const moment = require('moment');

module.exports = (db) =>{

    router.post('/addCustPurch',(req,res)=>{
        try{
        const {cust_id,pro_id,quantity,price,payment_type,advance,balance,total} = req.body;
        console.log("Payment Type :",payment_type)
        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
        const insertData = `insert into cust_purch_logs(cust_id,pro_id,quantity,price,payment_type,advance,balance,total,created_at) values (?,?,?,?,?,?,?,?,?)`;
        db.query(insertData,[cust_id,pro_id,quantity,price,payment_type,advance,balance,total,currentDate],(insertErr,insertRes)=>{
            if(insertErr){
                res.status(500).json({message:"Internal server error."})
            }else{
                res.status(200).json({message:"Customer purchase data addedd successfully."})
            }
        })
        }catch(error){
            res.status(500).json({message:"Internal server error."})
        }
        
    })

    router.get('/getCustPurchData',(req,res)=>{
        try{
            const emp_id = req.query.emp_id;
            const getData = `
                                select cust.cust_name,cust.cust_mobile,cust.cust_email,pro.pro_name,cust_purch.* from cust_purch_logs cust_purch 
                                inner join customers cust on cust.cust_id = cust_purch.cust_id inner join products pro on pro.pro_id = cust_purch .pro_id where cust.emp_id = ?
                            `;
            db.query(getData,[emp_id],(getErr,getRes)=>{
                if(getErr){
                    res.status(500).json({message:"Internal server error."})
                }else if(getRes.length === 0){
                    res.status(404).json({message:"Customer purchase data not found."})
                }else{
                    res.status(200).json(getRes)
                }
            })
        }catch(error){
            res.status(500).json({message:"Internal server error."})
        }
    })

    router.get('/getCustPurchDataForAdmin',(req,res)=>{
        try{
            const getData = `
                                select cust.cust_name,cust.cust_mobile,cust.cust_email,pro.pro_name,cust_purch.* from cust_purch_logs cust_purch 
                                inner join customers cust on cust.cust_id = cust_purch.cust_id inner join products pro on pro.pro_id = cust_purch .pro_id
                            `;
            db.query(getData,(getErr,getRes)=>{
                if(getErr){
                    res.status(500).json({message:"Internal server error."})
                }else if(getRes.length === 0){
                    res.status(404).json({message:"Customer purchase data not found."})
                }else{
                    res.status(200).json(getRes)
                }
            })
        }catch(error){
            res.status(500).json({message:"Internal server error."})
        }
    })

    router.put('/updateCustPurch/:cust_purch_id',(req,res)=>{
        try{
            const cust_purch_id = req.params.cust_purch_id;
            const {cust_id,pro_id,quantity,price,payment_type,advance,balance,total} = req.body; 
            const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
            const updateData = `update cust_purch_logs set cust_id = ?,pro_id = ?,quantity = ?,price = ?,payment_type = ?,advance = ?,balance = ?,total = ?,updated_at = ? where cust_purch_id = ?`;
            db.query(updateData,[cust_id,pro_id,quantity,price,payment_type,advance,balance,total,currentDate,cust_purch_id],(updateErr,updateRes)=>{
                if(updateErr){
                    res.status(500).json({message:"Internal server error."})
                }else{
                    res.status(200).json({message:"Customer purchase data updated successfully."})
                }
            })
        }catch(error){
            res.status(500).json({message:"Internal server error."})
        }
    })

    router.delete('/deleteCustPurch/:cust_purch_id',(req,res)=>{
        try{
            const cust_purch_id = req.params.cust_purch_id;
            const dltData = 'delete from cust_purch_logs where cust_purch_id = ?';
            db.query(dltData,[cust_purch_id],(dltErr,dltRes)=>{
                if(dltErr){
                    res.status(500).json({message:"Internal server error."})
                }else{
                    res.status(200).json({message:"customer purchase logs deleted successfully.."})
                }
            })
        }catch(error){
            res.status(500).json({message:"Internal server error."})
        }
    })




    router.get('/custPurchDashboard', (req, res) => {
        const getData = `
            SELECT
                c.cust_name,
                SUM(cp.total) AS total_amount,
                SUM(cp.advance) AS paid_amount,
                SUM(cp.balance) AS balance_amount
            FROM
                cust_purch_logs cp
            JOIN
                customers c ON cp.cust_id = c.cust_id
            GROUP BY
                c.cust_name
        `;
        
        const getGrandTotal = `
            SELECT SUM(total) AS grand_total FROM cust_purch_logs
        `;
    
        db.query(getData, (getErr, getRes) => {
            if (getErr) {
                res.status(500).json({ message: "Internal server error." });
            } else if (getRes.length === 0) {
                res.status(404).json({ message: "Data not found." });
            } else {
                db.query(getGrandTotal, (grandErr, grandRes) => {
                    if (grandErr) {
                        res.status(500).json({ message: "Internal server error." });
                    } else {
                        const grandTotal = grandRes[0].grand_total;
                        const dataWithGrandTotal = getRes.map(customer => ({
                            ...customer,
                            grand_total: grandTotal
                        }));
                        res.status(200).json(dataWithGrandTotal);
                    }
                });
            }
        });
    });
    
    
    
    

    return router;
}