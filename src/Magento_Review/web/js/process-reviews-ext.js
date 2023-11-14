/**
 * Instead of reviews pagination use "Load more reviews" button
 */
define(['jquery', 'loader', 'mage/translate'], function ($) {
    'use strict';

    return function () {
        var showMoreText = $.mage.__('Show %1 out of %2 reviews');
        var reviewContainerSelector = '#product-review-container';
        var reviewsCountSelectorClass = 'cs-reviews__count';
        var processedReviewsCount = 0;
        var $loadMoreReviewsButton;

        var addLoadMoreButton = function (
            nextPageUrl,
            reviewsCountForPage,
            numberOfReviews
        ) {
            $(reviewContainerSelector)
                .append(
                    '<div class="cs-reviews__button" id="load-more-reviews" data-next-url="' +
                        nextPageUrl +
                        '"><span>' +
                        $.mage.__('Show more') +
                        '<span class="count">' +
                        reviewsCountForPage +
                        '</span>' +
                        '</span></div>'
                )
                .append(
                    '<div class="' +
                        reviewsCountSelectorClass +
                        '">' +
                        showMoreText
                            .replace('%1', processedReviewsCount)
                            .replace('%2', numberOfReviews) +
                        '</div>'
                );

            $loadMoreReviewsButton = $('#load-more-reviews');
            $loadMoreReviewsButton.loader();
        };

        var updateLoadMoreButton = function (
            nextPageUrl,
            reviewsPerPage,
            numberOfReviews
        ) {
            $loadMoreReviewsButton.attr('data-next-url', nextPageUrl);

            $loadMoreReviewsButton.find('.count').text(reviewsPerPage);
            $('.' + reviewsCountSelectorClass).text(
                showMoreText
                    .replace('%1', processedReviewsCount)
                    .replace('%2', numberOfReviews)
            );

            $loadMoreReviewsButton.loader('hide');
        };

        var attachLoadMoreButtonEvents = function () {
            $loadMoreReviewsButton.on('click', function () {
                var nextUrl = $(this).attr('data-next-url');
                if (nextUrl) {
                    processReviewsLoadMore(nextUrl, true);
                }
            });
        };

        function processReviewsLoadMore(url, fromPages) {
            $.ajax({
                url: url,
                cache: true,
                dataType: 'html',
                showLoader: false,
                loaderContext: $('.product.data.items'),
            }).done(function (data) {
                var $newReviews = $(data).find('.cs-reviews__item');
                var reviewsPerPage = $newReviews.length;
                processedReviewsCount += reviewsPerPage;

                var $pagination = $(data).find('.cs-pagination__content');
                var numberOfReviews = parseInt(
                    $pagination.attr('data-reviews-number'),
                    10
                );
                var nextPageUrl = $pagination.attr('data-reviews-next-url');
                var lastPageNumber = parseInt(
                    $pagination.attr('data-reviews-last-page-number'),
                    10
                );
                var currentPage = parseInt(
                    $pagination.attr('data-reviews-current-page'),
                    10
                );
                var isLastPage = $pagination.attr('data-reviews-is-last-page');

                // Penultimate page
                if (lastPageNumber - currentPage === 1) {
                    reviewsPerPage =
                        numberOfReviews - currentPage * reviewsPerPage;
                }

                if (fromPages === true) {
                    $('#product-review-container .cs-reviews__list')
                        .append($newReviews)
                        .trigger('contentUpdated');

                    if (isLastPage) {
                        $loadMoreReviewsButton.hide();
                        $('.' + reviewsCountSelectorClass).hide();
                        return;
                    }

                    updateLoadMoreButton(
                        nextPageUrl,
                        reviewsPerPage,
                        numberOfReviews
                    );
                } else {
                    $('#product-review-container')
                        .append(data)
                        .trigger('contentUpdated');

                    if (!$(reviewContainerSelector + ' .pages').length) {
                        // There is only 10 or less reviews
                        return;
                    }

                    $('.cs-reviews').addClass('cs-reviews--load-more');
                    $(reviewContainerSelector + ' .pages').remove();

                    addLoadMoreButton(
                        nextPageUrl,
                        reviewsPerPage,
                        numberOfReviews
                    );
                    attachLoadMoreButtonEvents();
                }
            });
        }

        return function (config) {
            processReviewsLoadMore(config.productReviewUrl);

            $(function () {
                var $addReviewLinks = $('a[href="#reviews"]');
                var reviewsSection = document.querySelector('#reviews');

                if ($addReviewLinks.length && reviewsSection) {
                    var $collapsibleTrigger = $(reviewsSection).find(
                        '[data-role="title"]'
                    );

                    $addReviewLinks.on('click', function (e) {
                        e.preventDefault();

                        window.scrollTo({
                            top:
                                reviewsSection.getBoundingClientRect().top +
                                window.scrollY -
                                90,
                            behavior: 'smooth',
                        });

                        if (
                            $collapsibleTrigger.attr('aria-expanded') ===
                            'false'
                        ) {
                            $collapsibleTrigger.trigger('click');
                        }
                    });
                }
            });
        };
    };
});
