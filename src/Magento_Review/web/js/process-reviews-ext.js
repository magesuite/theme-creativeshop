/**
 * Instead of reviews pagination use "Load more reviews" button
 */

define(['jquery', 'loader', 'mage/translate'], function($) {
    'use strict';

    return function() {
        var reviewsCountForPage = 10;
        var reviewsPages = [];
        var pagesCount;
        var allReviewsCount = $('#reviews .counter').length
            ? parseInt($('#reviews .counter').text(), 10)
            : null;

        function processReviewsLoadMore(url, fromPages) {
            $.ajax({
                url: url,
                cache: true,
                dataType: 'html',
                showLoader: false,
                loaderContext: $('.product.data.items'),
            })
                .done(function(data) {
                    if (fromPages === true) {
                        var $newReviews = $(data).find('.cs-reviews__item');

                        if (reviewsPages.length === 1) {
                            // If there are only 2 pages of reviews calculate remaining reviews count on the last page
                            if (allReviewsCount) {
                                var lastPageReviewsCount =
                                    allReviewsCount -
                                    (pagesCount - 1) * reviewsCountForPage;
                                $('#load-more-reviews .count').text(
                                    lastPageReviewsCount
                                );
                                $('.cs-reviews__count').text(
                                    $.mage.__('Show %1 out of %2 reviews')
                                        .replace('%1', lastPageReviewsCount)
                                        .replace('%2', allReviewsCount)
                                );
                            }
                        }

                        $('#product-review-container .cs-reviews__list')
                            .append($newReviews)
                            .trigger('contentUpdated');

                        if (!reviewsPages.length) {
                            $('#load-more-reviews').remove();
                            $('.cs-reviews__count').remove();
                        }
                    } else {
                        $('#product-review-container')
                            .append(data)
                            .trigger('contentUpdated');

                        if (!$('#product-review-container .pages').length) {
                            // There is only 10 or less reviews
                            return;
                        } else {
                            $('.cs-reviews').addClass('cs-reviews--load-more');
                            reviewsCountForPage = $(data).find(
                                '.cs-reviews__item'
                            ).length;
                        }

                        // Gather reviews pages then remove pagination
                        $(
                            '#product-review-container .pages .cs-pagination__number'
                        ).each(function() {
                            if ($(this).attr('href')) {
                                reviewsPages.push($(this).attr('href'));
                            }
                        });
                        pagesCount = $(
                            '#product-review-container .pages .cs-pagination__number'
                        ).length;
                        $('#product-review-container .pages').remove();

                        // If there are only 2 pages of reviews calculate remaining reviews count on the last page
                        if (allReviewsCount && pagesCount === 2) {
                            reviewsCountForPage =
                                allReviewsCount - reviewsCountForPage;
                        }

                        // Append load more button and set action on click
                        $('#product-review-container').append(
                            '<div class="cs-reviews__button" id="load-more-reviews"><span>' +
                                $.mage.__('Show more') +
                                '<span class="count">' +
                                reviewsCountForPage +
                                '</span>' +
                                '</span></div>'
                        );

                        $('#product-review-container').append(
                            '<div class="cs-reviews__count">' +
                                $.mage.__('Show %1 out of %2 reviews')
                                    .replace('%1', reviewsCountForPage)
                                    .replace('%2', allReviewsCount) +
                                '</div>'
                        );

                        $('#load-more-reviews').loader();

                        $('#load-more-reviews').on('click', function() {
                            if (reviewsPages.length) {
                                processReviewsLoadMore(reviewsPages[0], true);
                                reviewsPages.shift();
                            } else {
                                $('#load-more-reviews').remove();
                            }

                            $('#load-more-reviews').loader('show');
                        });
                    }
                })
                .complete(function() {
                    if ($('#load-more-reviews').length) {
                        $('#load-more-reviews').loader('hide');
                    }
                });
        }

        return function(config) {
            var reviewTab = $(config.reviewsTabSelector);
            var requiredReviewTabRole = 'tab';

            if (
                reviewTab.attr('role') === requiredReviewTabRole &&
                reviewTab.hasClass('active')
            ) {
                processReviewsLoadMore(
                    config.productReviewUrl,
                    location.hash === '#reviews'
                );
            } else {
                reviewTab.one('beforeOpen', function() {
                    processReviewsLoadMore(config.productReviewUrl);
                });
            }

            $(function() {
                $('.product-info-main .reviews-actions a').click(function(
                    event
                ) {
                    var anchor;
                    var addReviewBlock;

                    event.preventDefault();
                    anchor = $(this)
                        .attr('href')
                        .replace(/^.*?(#|$)/, '');
                    addReviewBlock = $('#' + anchor);

                    if (addReviewBlock.length) {
                        $('.product.data.items [data-role="content"]').each(
                            function(index) {
                                //eslint-disable-line
                                if (this.id === 'reviews') {
                                    //eslint-disable-line eqeqeq
                                    $('.product.data.items').tabs(
                                        'activate',
                                        index
                                    );
                                }
                            }
                        );
                        $('html, body').animate(
                            {
                                scrollTop: addReviewBlock.offset().top - 50,
                            },
                            300
                        );
                    }
                });
            });
        };
    };
});
