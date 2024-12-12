const Item = require('../models/Item');
const multer = require('multer');
const bucket = require('../firebaseSetup');
const User = require('../models/User');

// Configure Multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });


exports.uploadItemImage = upload.single('image');


exports.createItem = async (req, res) => {
  const { name, category, weight, price, description } = req.body;
  try {
    // Fetch the seller's address from their profile
    const seller = await User.findById(req.user.userId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    console.log('Seller Address:', seller.profileDetails.address);
    let imageUrl = '';
    if (req.file) {
      const fileName = `images/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
      const file = bucket.file(fileName);

      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
        },
        public: true,
      });

      await file.makePublic();
      imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    // Save item to the database
    const item = await Item.create({
      name,
      category,
      weight,
      price,
      description,
      image: imageUrl,
      address: seller.profileDetails.address, // Use seller's address
      sellerId: req.user.userId,
    });

    res.status(201).json({ message: 'Item created', item });
  } catch (err) {
    console.error('Error creating item:', err.message);
    res.status(500).json({ message: 'Error creating item', error: err.message });
  }
};

// Get all items
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find({ status: 'available' }).populate('sellerId', 'name email phone address');
    res.status(200).json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ message: 'Error fetching items', error: err.message });
  }
};

// Get a specific item
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('sellerId', 'name email phone address ');
    if (!item) return res.status(404).json({ message: 'Item not found' });

    res.status(200).json(item);
  } catch (err) {
    console.error('Error fetching item:', err);
    res.status(500).json({ message: 'Error fetching item', error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { name, category, weight, price, description } = req.body;

    // Fetch the seller's address if it's not provided
    const seller = await User.findById(req.user.userId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    let imageUrl = req.body.image;
    if (req.file) {
      const fileName = `images/${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
      const file = bucket.file(fileName);

      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
        },
        public: true,
      });

      await file.makePublic();
      imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        weight,
        price,
        description,
        image: imageUrl,
        address: seller.address, // Ensure address is updated
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
  } catch (error) {
    console.error('Error updating item:', error.message);
    res.status(500).json({ message: 'Failed to update item', error: error.message });
  }
};


exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, sellerId: req.user.userId });
    if (!item) return res.status(404).json({ message: 'Item not found or not owned by user' });

    res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).json({ message: 'Error deleting item', error: err.message });
  }
};

// Get items created by the authenticated seller
exports.getOwnListings = async (req, res) => {
  try {
    // Fetch only available items created by the authenticated seller
    const items = await Item.find({ sellerId: req.user.userId, status: 'available' })
      .populate('sellerId', 'name email');
    res.status(200).json({ message: 'Own listings fetched successfully', items });
  } catch (err) {
    console.error('Error fetching own listings:', err);
    res.status(500).json({ message: 'Error fetching own listings', error: err.message });
  }
};


// Get item statuses
exports.getItemStatuses = async (req, res) => {
  try {
    const items = await Item.find({ sellerId: req.user.userId })
      .select('name image status') // Select only the fields you need
      .populate('sellerId', 'name address'); // Populate seller details (optional)

    res.status(200).json({ statuses: items });
  } catch (error) {
    console.error('Error fetching item statuses:', error.message);
    res.status(500).json({ message: 'Error fetching item statuses', error: error.message });
  }
};



