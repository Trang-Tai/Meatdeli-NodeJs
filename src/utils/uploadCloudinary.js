import cloudinary from "../config/cloudinary";
import { FOLDER } from '../utils/constant';

const uploadCloudinaryOptions = {
    uploadSingleFile(file, folder = FOLDER.USER) { // chơi ngu ko định dạng folder lcú đầu
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(file, { folder: folder, })
                .then((result) => {
                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                    })
                })
                .catch((err) => {
                    console.log(err);
                    resolve({
                        secure_url: '',
                        public_id: '',
                    })
                })
        })
    },

    uploadMultipleFile(arrFiles, folder) {
        const resultUploadFiles = arrFiles.map((file) => new Promise((resolve, reject) => {
            this.uploadSingleFile(file, folder)
                .then((fileData) => {
                    resolve(fileData);
                })
        }))
        return Promise.all(resultUploadFiles);
    },

    removeFile(cloudId) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(cloudId)
                .then((result) => {
                    resolve({
                        result
                    })
                })
                .catch((err) => {
                    console.log(err);
                    resolve({
                        result: 'error when destroy image'
                    })
                })
        })
    },

    removeMultipleFile(arrCloudId) {
        const resultRemoveMultiple = arrCloudId.map((cloudId) => {
            return this.removeFile(cloudId);
        })
        return Promise.all(resultRemoveMultiple);
    }
}

export default uploadCloudinaryOptions;