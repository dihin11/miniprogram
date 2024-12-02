const app = getApp();

const uploadImage = (imagePath) => {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${app.globalData.apiBaseUrl}/upload`,
      filePath: imagePath,
      name: 'photo',
      success: res => resolve(res),
      fail: err => reject(err)
    });
  });
};

const getFortuneTelling = async (type, images) => {
  try {
    const uploadResults = await Promise.all(images.map(uploadImage));
    const imageUrls = uploadResults.map(res => JSON.parse(res.data).url);

    const response = await wx.request({
      url: `${app.globalData.apiBaseUrl}/fortune`,
      method: 'POST',
      data: {
        type,
        images: imageUrls
      }
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadImage,
  getFortuneTelling
};