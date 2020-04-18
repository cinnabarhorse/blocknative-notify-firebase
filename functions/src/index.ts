import * as functions from 'firebase-functions';
const admin = require('firebase-admin')
admin.initializeApp()


exports.handleNotification = functions.https.onRequest(async (req, res) => {
    const hash = req.body.hash
    const status = req.body.status

    //Handle the cancel and speedup states
    if (status === "cancel" || status === "speedup") {

        const replaceHash = req.body.replaceHash

        try {

            await admin.firestore().collection("transactions").doc(hash).delete()

            await admin.firestore().collection("transactions").doc(replaceHash)
                .set({ status: req.body.status })

            res.send({ status: 200 })


        } catch (error) {
            console.log('error:', error)
            res.send({ status: 400, error: error })
        }
    }
    else {
        try {
            await admin.firestore().collection("transactions").doc(hash).set({ status: status })

            res.send({ status: 200 })
        } catch (error) {
            console.log('error:', error)
            res.send({ status: 400, error: error })
        }
    }
})
