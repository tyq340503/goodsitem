var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        createTime: {
            type: Date,
            default: Date.now
        },
        updateTime: {
            type: Date,
            default: Date.now
        }
    }
}, {
        versionKey: false,
        timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
    });

module.exports = mongoose.model("Comment", commentSchema);