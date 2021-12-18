__webpack_public_path__ = window.__webpack_public_path__; // eslint-disable-line

import Global from './theme/global';
import utils from '@bigcommerce/stencil-utils';

const getAccount = () => import('./theme/account');
const getLogin = () => import('./theme/auth');
const noop = null;

const pageClasses = {
    account_orderstatus: getAccount,
    account_order: getAccount,
    account_addressbook: getAccount,
    shippingaddressform: getAccount,
    account_new_return: getAccount,
    'add-wishlist': () => import('./theme/wishlist'),
    account_recentitems: getAccount,
    account_downloaditem: getAccount,
    editaccount: getAccount,
    account_inbox: getAccount,
    account_saved_return: getAccount,
    account_returns: getAccount,
    account_paymentmethods: getAccount,
    account_addpaymentmethod: getAccount,
    account_editpaymentmethod: getAccount,
    login: getLogin,
    createaccount_thanks: getLogin,
    createaccount: getLogin,
    getnewpassword: getLogin,
    forgotpassword: getLogin,
    blog: noop,
    blog_post: noop,
    brand: () => import('./theme/brand'),
    brands: noop,
    cart: () => import('./theme/cart'),
    category: () => import('./theme/category'),
    compare: () => import('./theme/compare'),
    page_contact_form: () => import('./theme/contact-us'),
    error: noop,
    404: noop,
    giftcertificates: () => import('./theme/gift-certificate'),
    giftcertificates_balance: () => import('./theme/gift-certificate'),
    giftcertificates_redeem: () => import('./theme/gift-certificate'),
    default: noop,
    page: noop,
    product: () => import('./theme/product'),
    amp_product_options: () => import('./theme/product'),
    search: () => import('./theme/search'),
    rss: noop,
    sitemap: noop,
    newsletter_subscribe: noop,
    wishlist: () => import('./theme/wishlist'),
    wishlists: () => import('./theme/wishlist'),
};

const customClasses = {};

/**
 * This function gets added to the global window and then called
 * on page load with the current template loaded and JS Context passed in
 * @param pageType String
 * @param contextJSON
 * @returns {*}
 */
window.stencilBootstrap = function stencilBootstrap(pageType, contextJSON = null, loadGlobal = true) {
    const context = JSON.parse(contextJSON || '{}');

    return {
        load() {
            $(() => {
                // Load globals
                if (loadGlobal) {
                    Global.load(context);
                }

                const importPromises = [];

                // Find the appropriate page loader based on pageType
                const pageClassImporter = pageClasses[pageType];
                if (typeof pageClassImporter === 'function') {
                    importPromises.push(pageClassImporter());
                }

                // See if there is a page class default for a custom template
                const customTemplateImporter = customClasses[context.template];
                if (typeof customTemplateImporter === 'function') {
                    importPromises.push(customTemplateImporter());
                }

                // Wait for imports to resolve, then call load() on them
                Promise.all(importPromises).then(imports => {
                    imports.forEach(imported => {
                        imported.default.load(context);
                    });
                });
            });
            $('.card-image').each(function() {
                $(this).on('mouseenter', function() {
                    var newImg = $(this).attr('data_hoverimage');
                    $(this).attr('srcset', newImg);
                }).on('mouseleave', function() {
                    var newImg = $(this).attr('default_image');
                    $(this).attr('srcset', newImg);
                });
            });

            $("button#add_all_to_cart").on('click', function() {
                var category_id = $(this).data('category-id');
                return $.get(`https://api.bigcommerce.com/stores/gxxsugbxzz/v3/catalog/products?categories:in=${category_id}`, function(data, status, xhr) {
                    for (let i = 0; i < data.length; i++) {
                        $.get(`/cart.php?action=add&product_id=${data[i].id}`)
                        .fail(function(xhr, status, error) {
                            console.error(error);
                            return xhr.done();
                        });
                    }
                })
                .fail(function(xhr, status, error) {
                    console.error(error);
                    return xhr.done();
                })
            });
            $("button#remove_all_items").on('click', function() {
                var category_id = $(this).data('category-id');
                return $.get(`https://api.bigcommerce.com/stores/gxxsugbxzz/v3/catalog/products?categories:in=${category_id}`, function(data, status, xhr) {
                    for (let i = 0; i < data.length; i++) {
                        utils.api.cart.itemUpdate(data[i].id, 0, (err, response) => {
                            if (response.data.status === 'succeed') {
                                const remove = (newQty === 0);
                                this.refreshContent(remove);
                            } else {
                                $el.val(oldQty);
                                swal.fire({
                                    text: response.data.errors.join('\n'),
                                    icon: 'error',
                                });
                            }
                        });
                    }
                })
                .fail(function(xhr, status, error) {
                    console.error(error);
                    return xhr.done();
                })
            });
        },
    };
};
