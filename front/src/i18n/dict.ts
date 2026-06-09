import type { LanguageCode } from '@/api/types';

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  ps: 'پښتو',
  'zh-CN': '简体中文',
};

export const RTL_LANGUAGES: ReadonlySet<LanguageCode> = new Set(['ps']);

export type TranslationKey =
  | 'app.title'
  | 'topbar.search.placeholder'
  | 'topbar.cart'
  | 'topbar.cart.empty'
  | 'topbar.language'
  | 'topbar.currency'
  | 'filters.allCategories'
  | 'product.addToCart'
  | 'product.outOfStock'
  | 'product.stock'
  | 'product.inCart'
  | 'cart.title'
  | 'cart.empty'
  | 'cart.subtotal'
  | 'cart.checkout'
  | 'cart.continueShopping'
  | 'cart.remove'
  | 'cart.quantity'
  | 'cart.maxStock'
  | 'checkout.title'
  | 'checkout.back'
  | 'checkout.customer'
  | 'checkout.name'
  | 'checkout.phone'
  | 'checkout.telegram'
  | 'checkout.telegramHint'
  | 'checkout.comment'
  | 'checkout.delivery'
  | 'checkout.deliveryFee'
  | 'checkout.summary'
  | 'checkout.subtotal'
  | 'checkout.total'
  | 'checkout.placeOrder'
  | 'checkout.placing'
  | 'checkout.quoting'
  | 'checkout.requireDelivery'
  | 'checkout.requireItems'
  | 'success.title'
  | 'success.orderNumber'
  | 'success.total'
  | 'success.note'
  | 'success.continue'
  | 'success.savedToAccount'
  | 'auth.title'
  | 'auth.loginTitle'
  | 'auth.guest'
  | 'auth.guestHint'
  | 'auth.signIn'
  | 'auth.signUp'
  | 'auth.email'
  | 'auth.password'
  | 'auth.fullName'
  | 'auth.submit'
  | 'auth.signedInAs'
  | 'auth.logout'
  | 'auth.haveAccount'
  | 'auth.noAccount'
  | 'auth.myOrders'
  | 'auth.forgotPassword'
  | 'auth.forgotTitle'
  | 'auth.forgotHint'
  | 'auth.sendResetLink'
  | 'auth.recoverySent'
  | 'auth.resetTitle'
  | 'auth.resetSubmit'
  | 'auth.resetDone'
  | 'auth.backToLogin'
  | 'auth.resetInvalid'
  | 'myOrders.title'
  | 'myOrders.empty'
  | 'myOrders.created'
  | 'myOrders.status'
  | 'myOrders.total'
  | 'myOrders.items'
  | 'myOrders.subtotal'
  | 'myOrders.deliveryFee'
  | 'myOrders.deliveryTo'
  | 'myOrders.comment'
  | 'account.overview'
  | 'account.orders'
  | 'account.profile'
  | 'account.welcome'
  | 'account.recentOrders'
  | 'account.viewAll'
  | 'profile.email'
  | 'profile.fullName'
  | 'profile.save'
  | 'profile.changePassword'
  | 'profile.currentPassword'
  | 'profile.newPassword'
  | 'profile.savedOk'
  | 'profile.passwordOk'
  | 'admin.dashboard'
  | 'admin.orders'
  | 'admin.products'
  | 'admin.categories'
  | 'admin.deliveryPlaces'
  | 'admin.users'
  | 'admin.accessDenied'
  | 'admin.backHome'
  | 'admin.metric.products'
  | 'admin.metric.activeProducts'
  | 'admin.metric.lowStock'
  | 'admin.metric.deliveryPlaces'
  | 'admin.metric.activeDeliveryPlaces'
  | 'admin.metric.newOrders'
  | 'admin.metric.activeOrders'
  | 'admin.filter.status'
  | 'admin.filter.search'
  | 'admin.filter.dateFrom'
  | 'admin.filter.dateTo'
  | 'admin.filter.reset'
  | 'admin.action.create'
  | 'admin.action.edit'
  | 'admin.action.delete'
  | 'admin.action.save'
  | 'admin.action.cancel'
  | 'admin.action.confirm'
  | 'admin.action.accept'
  | 'admin.action.complete'
  | 'admin.action.cancelOrder'
  | 'admin.action.changeStatus'
  | 'admin.action.upload'
  | 'admin.field.adminComment'
  | 'admin.field.statusHistory'
  | 'admin.field.customer'
  | 'admin.field.image'
  | 'admin.field.sortOrder'
  | 'admin.field.active'
  | 'admin.field.superuser'
  | 'admin.confirmDelete'
  | 'admin.telegram'
  | 'admin.telegram.title'
  | 'admin.telegram.botToken'
  | 'admin.telegram.chatId'
  | 'admin.telegram.enabled'
  | 'admin.telegram.hint'
  | 'admin.telegram.tokenPlaceholder'
  | 'admin.telegram.test'
  | 'admin.telegram.testOk'
  | 'admin.telegram.savedOk'
  | 'admin.telegram.statusConfigured'
  | 'admin.telegram.statusMissing'
  | 'admin.live'
  | 'admin.offline'
  | 'admin.newOrders'
  | 'admin.page.prev'
  | 'admin.page.next'
  | 'admin.page.range'
  | 'common.loading'
  | 'common.retry'
  | 'common.close'
  | 'common.error'
  | 'common.empty'
  | 'common.noProducts'
  | 'common.noImage'
  | 'common.all';

type Dict = Record<TranslationKey, string>;

const en: Dict = {
  'app.title': 'Shop Meraj',
  'topbar.search.placeholder': 'Search products',
  'topbar.cart': 'Cart',
  'topbar.cart.empty': 'Cart is empty',
  'topbar.language': 'Language',
  'topbar.currency': 'Currency',
  'filters.allCategories': 'All categories',
  'product.addToCart': 'Add to cart',
  'product.outOfStock': 'Out of stock',
  'product.stock': 'In stock: {count}',
  'product.inCart': 'In cart: {count}',
  'cart.title': 'Your cart',
  'cart.empty': 'Your cart is empty.',
  'cart.subtotal': 'Subtotal',
  'cart.checkout': 'Checkout',
  'cart.continueShopping': 'Continue shopping',
  'cart.remove': 'Remove',
  'cart.quantity': 'Quantity',
  'cart.maxStock': 'Only {count} left',
  'checkout.title': 'Checkout',
  'checkout.back': 'Back to cart',
  'checkout.customer': 'Customer details',
  'checkout.name': 'Full name',
  'checkout.phone': 'Phone',
  'checkout.telegram': 'Telegram',
  'checkout.telegramHint': 'Optional, e.g. @username',
  'checkout.comment': 'Order notes',
  'checkout.delivery': 'Delivery address',
  'checkout.deliveryFee': 'Delivery fee',
  'checkout.summary': 'Order summary',
  'checkout.subtotal': 'Subtotal',
  'checkout.total': 'Total',
  'checkout.placeOrder': 'Place order',
  'checkout.placing': 'Placing order…',
  'checkout.quoting': 'Calculating total…',
  'checkout.requireDelivery': 'Choose a delivery address.',
  'checkout.requireItems': 'Cart is empty.',
  'success.title': 'Order placed',
  'success.orderNumber': 'Order number',
  'success.total': 'Total',
  'success.note': 'We will contact you shortly to confirm the delivery.',
  'success.continue': 'Back to shop',
  'success.savedToAccount': 'Saved to your account',
  'auth.title': 'Place order as',
  'auth.loginTitle': 'Sign in to your account',
  'auth.guest': 'Guest',
  'auth.guestHint': 'Continue without an account.',
  'auth.signIn': 'Sign in',
  'auth.signUp': 'Sign up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.fullName': 'Full name',
  'auth.submit': 'Continue',
  'auth.signedInAs': 'Signed in as {name}',
  'auth.logout': 'Sign out',
  'auth.haveAccount': 'Already have an account? Sign in',
  'auth.noAccount': "Don't have an account? Sign up",
  'auth.myOrders': 'My orders',
  'auth.forgotPassword': 'Forgot password?',
  'auth.forgotTitle': 'Reset your password',
  'auth.forgotHint': "Enter your email and we'll send you a reset link.",
  'auth.sendResetLink': 'Send reset link',
  'auth.recoverySent': 'If that email is registered, a reset link has been sent.',
  'auth.resetTitle': 'Set a new password',
  'auth.resetSubmit': 'Update password',
  'auth.resetDone': 'Password updated. You can sign in now.',
  'auth.backToLogin': 'Back to sign in',
  'auth.resetInvalid': 'This reset link is invalid or has expired.',
  'myOrders.title': 'My orders',
  'myOrders.empty': 'No orders yet.',
  'myOrders.created': 'Created',
  'myOrders.status': 'Status',
  'myOrders.total': 'Total',
  'myOrders.items': 'Items',
  'myOrders.subtotal': 'Subtotal',
  'myOrders.deliveryFee': 'Delivery',
  'myOrders.deliveryTo': 'Delivery to',
  'myOrders.comment': 'Note',
  'account.overview': 'Overview',
  'account.orders': 'My orders',
  'account.profile': 'Profile',
  'account.welcome': 'Welcome, {name}',
  'account.recentOrders': 'Recent orders',
  'account.viewAll': 'View all',
  'profile.email': 'Email',
  'profile.fullName': 'Full name',
  'profile.save': 'Save changes',
  'profile.changePassword': 'Change password',
  'profile.currentPassword': 'Current password',
  'profile.newPassword': 'New password',
  'profile.savedOk': 'Profile updated',
  'profile.passwordOk': 'Password updated',
  'admin.dashboard': 'Dashboard',
  'admin.orders': 'Orders',
  'admin.products': 'Products',
  'admin.categories': 'Categories',
  'admin.deliveryPlaces': 'Delivery places',
  'admin.users': 'Users',
  'admin.accessDenied': 'Admin only. You do not have access.',
  'admin.backHome': 'Back to shop',
  'admin.metric.products': 'Products',
  'admin.metric.activeProducts': 'Active products',
  'admin.metric.lowStock': 'Low stock',
  'admin.metric.deliveryPlaces': 'Delivery places',
  'admin.metric.activeDeliveryPlaces': 'Active delivery',
  'admin.metric.newOrders': 'New orders',
  'admin.metric.activeOrders': 'Active orders',
  'admin.filter.status': 'Status',
  'admin.filter.search': 'Search',
  'admin.filter.dateFrom': 'From',
  'admin.filter.dateTo': 'To',
  'admin.filter.reset': 'Reset',
  'admin.action.create': 'Create',
  'admin.action.edit': 'Edit',
  'admin.action.delete': 'Delete',
  'admin.action.save': 'Save',
  'admin.action.cancel': 'Cancel',
  'admin.action.confirm': 'Confirm',
  'admin.action.accept': 'Accept',
  'admin.action.complete': 'Complete',
  'admin.action.cancelOrder': 'Cancel order',
  'admin.action.changeStatus': 'Change status',
  'admin.action.upload': 'Upload image',
  'admin.field.adminComment': 'Admin comment',
  'admin.field.statusHistory': 'Status history',
  'admin.field.customer': 'Customer',
  'admin.field.image': 'Image',
  'admin.field.sortOrder': 'Sort order',
  'admin.field.active': 'Active',
  'admin.field.superuser': 'Superuser',
  'admin.confirmDelete': 'Delete this item?',
  'admin.telegram': 'Telegram',
  'admin.telegram.title': 'Telegram notifications',
  'admin.telegram.botToken': 'Bot token',
  'admin.telegram.chatId': 'Owner chat ID',
  'admin.telegram.enabled': 'Send notifications',
  'admin.telegram.hint':
    'New orders are sent to this Telegram chat. Get a token from @BotFather and the chat ID from your bot.',
  'admin.telegram.tokenPlaceholder': 'Leave blank to keep the current token',
  'admin.telegram.test': 'Send test message',
  'admin.telegram.testOk': 'Test message sent',
  'admin.telegram.savedOk': 'Settings saved',
  'admin.telegram.statusConfigured': 'Active',
  'admin.telegram.statusMissing': 'Not configured',
  'admin.live': 'Live',
  'admin.offline': 'Reconnecting…',
  'admin.newOrders': '{count} new — refresh',
  'admin.page.prev': 'Previous',
  'admin.page.next': 'Next',
  'admin.page.range': '{from}–{to} of {total}',
  'common.loading': 'Loading…',
  'common.retry': 'Retry',
  'common.close': 'Close',
  'common.error': 'Something went wrong',
  'common.empty': 'Nothing here yet',
  'common.noProducts': 'No products match your search',
  'common.noImage': 'No image',
  'common.all': 'All',
};

const ps: Dict = {
  'app.title': 'د مېراج پلورنځی',
  'topbar.search.placeholder': 'د توکو لټون',
  'topbar.cart': 'سبد',
  'topbar.cart.empty': 'سبد خالي دی',
  'topbar.language': 'ژبه',
  'topbar.currency': 'اسعار',
  'filters.allCategories': 'ټولې کټګورۍ',
  'product.addToCart': 'سبد ته اضافه کړئ',
  'product.outOfStock': 'پای ته رسېدلی',
  'product.stock': 'موجود: {count}',
  'product.inCart': 'په سبد کې: {count}',
  'cart.title': 'ستاسو سبد',
  'cart.empty': 'ستاسو سبد خالي دی.',
  'cart.subtotal': 'فرعي ټوله',
  'cart.checkout': 'پای ته رسول',
  'cart.continueShopping': 'پیرودنه دوام ورکړئ',
  'cart.remove': 'لرې کول',
  'cart.quantity': 'مقدار',
  'cart.maxStock': 'یوازې {count} پاتې دي',
  'checkout.title': 'د سپارښتنې پای ته رسول',
  'checkout.back': 'سبد ته بېرته',
  'checkout.customer': 'د پیرودونکي معلومات',
  'checkout.name': 'بشپړ نوم',
  'checkout.phone': 'تلیفون',
  'checkout.telegram': 'ټلګرام',
  'checkout.telegramHint': 'اختیاري، د بېلګې په توګه @username',
  'checkout.comment': 'د سپارښتنې یاداښتونه',
  'checkout.delivery': 'د لېږد پته',
  'checkout.deliveryFee': 'د لېږد لګښت',
  'checkout.summary': 'د سپارښتنې لنډیز',
  'checkout.subtotal': 'فرعي ټوله',
  'checkout.total': 'ټوله',
  'checkout.placeOrder': 'سپارښتنه ثبت کړئ',
  'checkout.placing': 'سپارښتنه ثبتېږي…',
  'checkout.quoting': 'مجموعه محاسبه کېږي…',
  'checkout.requireDelivery': 'مهرباني وکړئ د لېږد پته وټاکئ.',
  'checkout.requireItems': 'سبد خالي دی.',
  'success.title': 'سپارښتنه ثبت شوه',
  'success.orderNumber': 'د سپارښتنې شمېره',
  'success.total': 'ټوله',
  'success.note': 'موږ به ډېر ژر د تایید لپاره ستاسو سره اړیکه ونیسو.',
  'success.continue': 'پلورنځي ته بېرته',
  'success.savedToAccount': 'ستاسو حساب کې خوندي شوه',
  'auth.title': 'د سپارښتنې طرز',
  'auth.loginTitle': 'ستاسو حساب ته ننوتل',
  'auth.guest': 'مېلمه',
  'auth.guestHint': 'پرته له حساب دوام ورکړئ.',
  'auth.signIn': 'ننوتل',
  'auth.signUp': 'حساب جوړول',
  'auth.email': 'ایمیل',
  'auth.password': 'پاسورډ',
  'auth.fullName': 'بشپړ نوم',
  'auth.submit': 'دوام',
  'auth.signedInAs': 'د {name} په توګه ننوتل شوي',
  'auth.logout': 'وتل',
  'auth.haveAccount': 'مخکې حساب لرئ؟ ننوتل',
  'auth.noAccount': 'حساب نه لرئ؟ نوي جوړ کړئ',
  'auth.myOrders': 'زما سپارښتنې',
  'auth.forgotPassword': 'پاسورډ مو هیر شو؟',
  'auth.forgotTitle': 'پاسورډ بیا تنظیم کړئ',
  'auth.forgotHint': 'خپل ایمیل ولیکئ، موږ به تاسو ته د بیا تنظیم لینک واستوو.',
  'auth.sendResetLink': 'د بیا تنظیم لینک واستوئ',
  'auth.recoverySent': 'که دا ایمیل ثبت وي، د بیا تنظیم لینک ولېږل شو.',
  'auth.resetTitle': 'نوی پاسورډ وټاکئ',
  'auth.resetSubmit': 'پاسورډ تازه کړئ',
  'auth.resetDone': 'پاسورډ تازه شو. اوس ننوتلی شئ.',
  'auth.backToLogin': 'ننوتلو ته بېرته',
  'auth.resetInvalid': 'دا لینک ناسم یا پای ته رسېدلی دی.',
  'myOrders.title': 'زما سپارښتنې',
  'myOrders.empty': 'لا تر اوسه هېڅ سپارښتنه نشته.',
  'myOrders.created': 'نېټه',
  'myOrders.status': 'حالت',
  'myOrders.total': 'ټوله',
  'myOrders.items': 'توکي',
  'myOrders.subtotal': 'فرعي ټوله',
  'myOrders.deliveryFee': 'لېږد',
  'myOrders.deliveryTo': 'د لېږد ځای',
  'myOrders.comment': 'یاداښت',
  'account.overview': 'لنډ کتنه',
  'account.orders': 'زما سپارښتنې',
  'account.profile': 'پروفایل',
  'account.welcome': 'ښه راغلې، {name}',
  'account.recentOrders': 'وروستۍ سپارښتنې',
  'account.viewAll': 'ټول وګورئ',
  'profile.email': 'ایمیل',
  'profile.fullName': 'بشپړ نوم',
  'profile.save': 'خوندي کول',
  'profile.changePassword': 'پاسورډ بدلول',
  'profile.currentPassword': 'اوسنی پاسورډ',
  'profile.newPassword': 'نوی پاسورډ',
  'profile.savedOk': 'پروفایل تازه شو',
  'profile.passwordOk': 'پاسورډ بدل شو',
  'admin.dashboard': 'ډشبورډ',
  'admin.orders': 'سپارښتنې',
  'admin.products': 'توکي',
  'admin.categories': 'کټګورۍ',
  'admin.deliveryPlaces': 'د لېږد ځایونه',
  'admin.users': 'کاروونکي',
  'admin.accessDenied': 'یوازې ادمین. تاسو لاسرسی نه لرئ.',
  'admin.backHome': 'پلورنځي ته بېرته',
  'admin.metric.products': 'توکي',
  'admin.metric.activeProducts': 'فعال توکي',
  'admin.metric.lowStock': 'لږ موجود',
  'admin.metric.deliveryPlaces': 'لېږد ځایونه',
  'admin.metric.activeDeliveryPlaces': 'فعال لېږد',
  'admin.metric.newOrders': 'نوې سپارښتنې',
  'admin.metric.activeOrders': 'فعالې سپارښتنې',
  'admin.filter.status': 'حالت',
  'admin.filter.search': 'لټون',
  'admin.filter.dateFrom': 'له',
  'admin.filter.dateTo': 'تر',
  'admin.filter.reset': 'بیرته',
  'admin.action.create': 'جوړول',
  'admin.action.edit': 'سمول',
  'admin.action.delete': 'ړنګول',
  'admin.action.save': 'خوندي کول',
  'admin.action.cancel': 'لغوه',
  'admin.action.confirm': 'تایید',
  'admin.action.accept': 'ومنل',
  'admin.action.complete': 'بشپړول',
  'admin.action.cancelOrder': 'سپارښتنه لغوه',
  'admin.action.changeStatus': 'حالت بدلول',
  'admin.action.upload': 'انځور پورته کول',
  'admin.field.adminComment': 'د ادمین یاداښت',
  'admin.field.statusHistory': 'د حالت تاریخ',
  'admin.field.customer': 'پیرودونکی',
  'admin.field.image': 'انځور',
  'admin.field.sortOrder': 'د ترتیب کرښه',
  'admin.field.active': 'فعال',
  'admin.field.superuser': 'سپر کاروونکی',
  'admin.confirmDelete': 'دا توکی ړنګ کړئ؟',
  'admin.telegram': 'ټلیګرام',
  'admin.telegram.title': 'د ټلیګرام خبرتیاوې',
  'admin.telegram.botToken': 'د بوټ ټوکن',
  'admin.telegram.chatId': 'د مالک چټ ID',
  'admin.telegram.enabled': 'خبرتیاوې واستوئ',
  'admin.telegram.hint':
    'نوې سپارښتنې دې ټلیګرام چټ ته لېږل کېږي. ټوکن له @BotFather او د چټ ID له خپل بوټ څخه ترلاسه کړئ.',
  'admin.telegram.tokenPlaceholder': 'د اوسني ټوکن ساتلو لپاره خالي پرېږدئ',
  'admin.telegram.test': 'د ازموینې پیغام واستوئ',
  'admin.telegram.testOk': 'د ازموینې پیغام ولېږل شو',
  'admin.telegram.savedOk': 'تنظیمات خوندي شول',
  'admin.telegram.statusConfigured': 'فعال',
  'admin.telegram.statusMissing': 'نه دی تنظیم شوی',
  'admin.live': 'ژوندی',
  'admin.offline': 'بیا نښلول…',
  'admin.newOrders': '{count} نوي — تازه کړئ',
  'admin.page.prev': 'مخکینی',
  'admin.page.next': 'راتلونکی',
  'admin.page.range': '{from}–{to} له {total}',
  'common.loading': 'بارېږي…',
  'common.retry': 'بیا هڅه وکړئ',
  'common.close': 'بندول',
  'common.error': 'یوه ستونزه رامنځته شوه',
  'common.empty': 'دلته څه نشته',
  'common.noProducts': 'د لټون پایلې ونه موندل شوې',
  'common.noImage': 'انځور نشته',
  'common.all': 'ټول',
};

const zhCN: Dict = {
  'app.title': '梅拉吉商店',
  'topbar.search.placeholder': '搜索商品',
  'topbar.cart': '购物车',
  'topbar.cart.empty': '购物车为空',
  'topbar.language': '语言',
  'topbar.currency': '货币',
  'filters.allCategories': '全部分类',
  'product.addToCart': '加入购物车',
  'product.outOfStock': '缺货',
  'product.stock': '库存：{count}',
  'product.inCart': '已选：{count}',
  'cart.title': '您的购物车',
  'cart.empty': '购物车为空。',
  'cart.subtotal': '小计',
  'cart.checkout': '结算',
  'cart.continueShopping': '继续购物',
  'cart.remove': '移除',
  'cart.quantity': '数量',
  'cart.maxStock': '仅剩 {count} 件',
  'checkout.title': '结算',
  'checkout.back': '返回购物车',
  'checkout.customer': '客户信息',
  'checkout.name': '姓名',
  'checkout.phone': '电话',
  'checkout.telegram': 'Telegram',
  'checkout.telegramHint': '可选，例如 @username',
  'checkout.comment': '订单备注',
  'checkout.delivery': '配送地址',
  'checkout.deliveryFee': '配送费',
  'checkout.summary': '订单摘要',
  'checkout.subtotal': '小计',
  'checkout.total': '合计',
  'checkout.placeOrder': '提交订单',
  'checkout.placing': '正在提交…',
  'checkout.quoting': '正在计算总价…',
  'checkout.requireDelivery': '请选择配送地址。',
  'checkout.requireItems': '购物车为空。',
  'success.title': '订单已提交',
  'success.orderNumber': '订单号',
  'success.total': '合计',
  'success.note': '我们会尽快与您联系确认配送。',
  'success.continue': '返回商店',
  'success.savedToAccount': '已保存到您的账户',
  'auth.title': '下单方式',
  'auth.loginTitle': '登录账号',
  'auth.guest': '访客',
  'auth.guestHint': '无需注册即可下单。',
  'auth.signIn': '登录',
  'auth.signUp': '注册',
  'auth.email': '邮箱',
  'auth.password': '密码',
  'auth.fullName': '姓名',
  'auth.submit': '继续',
  'auth.signedInAs': '已登录：{name}',
  'auth.logout': '退出登录',
  'auth.haveAccount': '已有账号？去登录',
  'auth.noAccount': '没有账号？注册',
  'auth.myOrders': '我的订单',
  'auth.forgotPassword': '忘记密码？',
  'auth.forgotTitle': '重置密码',
  'auth.forgotHint': '输入您的邮箱，我们将发送重置链接。',
  'auth.sendResetLink': '发送重置链接',
  'auth.recoverySent': '如果该邮箱已注册，重置链接已发送。',
  'auth.resetTitle': '设置新密码',
  'auth.resetSubmit': '更新密码',
  'auth.resetDone': '密码已更新，现在可以登录。',
  'auth.backToLogin': '返回登录',
  'auth.resetInvalid': '此重置链接无效或已过期。',
  'myOrders.title': '我的订单',
  'myOrders.empty': '暂无订单。',
  'myOrders.created': '创建时间',
  'myOrders.status': '状态',
  'myOrders.total': '合计',
  'myOrders.items': '商品',
  'myOrders.subtotal': '小计',
  'myOrders.deliveryFee': '配送费',
  'myOrders.deliveryTo': '配送至',
  'myOrders.comment': '备注',
  'account.overview': '概览',
  'account.orders': '我的订单',
  'account.profile': '资料',
  'account.welcome': '您好，{name}',
  'account.recentOrders': '最近订单',
  'account.viewAll': '查看全部',
  'profile.email': '邮箱',
  'profile.fullName': '姓名',
  'profile.save': '保存',
  'profile.changePassword': '修改密码',
  'profile.currentPassword': '当前密码',
  'profile.newPassword': '新密码',
  'profile.savedOk': '已保存',
  'profile.passwordOk': '密码已更新',
  'admin.dashboard': '仪表盘',
  'admin.orders': '订单',
  'admin.products': '商品',
  'admin.categories': '分类',
  'admin.deliveryPlaces': '配送点',
  'admin.users': '用户',
  'admin.accessDenied': '仅管理员可访问。',
  'admin.backHome': '返回商店',
  'admin.metric.products': '商品总数',
  'admin.metric.activeProducts': '在售商品',
  'admin.metric.lowStock': '库存不足',
  'admin.metric.deliveryPlaces': '配送点',
  'admin.metric.activeDeliveryPlaces': '启用配送',
  'admin.metric.newOrders': '新订单',
  'admin.metric.activeOrders': '处理中订单',
  'admin.filter.status': '状态',
  'admin.filter.search': '搜索',
  'admin.filter.dateFrom': '自',
  'admin.filter.dateTo': '至',
  'admin.filter.reset': '重置',
  'admin.action.create': '新建',
  'admin.action.edit': '编辑',
  'admin.action.delete': '删除',
  'admin.action.save': '保存',
  'admin.action.cancel': '取消',
  'admin.action.confirm': '确认',
  'admin.action.accept': '接受',
  'admin.action.complete': '完成',
  'admin.action.cancelOrder': '取消订单',
  'admin.action.changeStatus': '更新状态',
  'admin.action.upload': '上传图片',
  'admin.field.adminComment': '管理员备注',
  'admin.field.statusHistory': '状态历史',
  'admin.field.customer': '客户',
  'admin.field.image': '图片',
  'admin.field.sortOrder': '排序',
  'admin.field.active': '启用',
  'admin.field.superuser': '超级用户',
  'admin.confirmDelete': '确定删除？',
  'admin.telegram': 'Telegram',
  'admin.telegram.title': 'Telegram 通知',
  'admin.telegram.botToken': '机器人 Token',
  'admin.telegram.chatId': '所有者 Chat ID',
  'admin.telegram.enabled': '发送通知',
  'admin.telegram.hint':
    '新订单会发送到此 Telegram 会话。从 @BotFather 获取 Token，从机器人获取 Chat ID。',
  'admin.telegram.tokenPlaceholder': '留空以保留当前 Token',
  'admin.telegram.test': '发送测试消息',
  'admin.telegram.testOk': '测试消息已发送',
  'admin.telegram.savedOk': '设置已保存',
  'admin.telegram.statusConfigured': '已启用',
  'admin.telegram.statusMissing': '未配置',
  'admin.live': '实时',
  'admin.offline': '重新连接…',
  'admin.newOrders': '{count} 个新订单 — 刷新',
  'admin.page.prev': '上一页',
  'admin.page.next': '下一页',
  'admin.page.range': '{from}–{to}，共 {total}',
  'common.loading': '加载中…',
  'common.retry': '重试',
  'common.close': '关闭',
  'common.error': '出错了',
  'common.empty': '这里还没有内容',
  'common.noProducts': '没有匹配的商品',
  'common.noImage': '暂无图片',
  'common.all': '全部',
};

export const DICT: Record<LanguageCode, Dict> = {
  en,
  ps,
  'zh-CN': zhCN,
};

export function translate(
  language: LanguageCode,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const template = DICT[language]?.[key] ?? DICT.en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
    const value = vars[name];
    return value == null ? '' : String(value);
  });
}
